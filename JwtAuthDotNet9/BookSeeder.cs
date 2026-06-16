using booksa.Models;
using booksa.Services.BooksService;
using System.Net.Http.Json;
using System.Text.Json;

namespace booksa
{
    public class BookSeeder
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BookSeeder> _logger;
        private readonly HttpClient _httpClient;
        private readonly Random _random;

        public BookSeeder(IBookService bookService, ILogger<BookSeeder> logger, IHttpClientFactory httpClientFactory)
        {
            _bookService = bookService;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri("https://www.googleapis.com/books/v1/");
            _random = new Random();
        }

        public async Task SeedInitialBooksAsync()
        {
            try
            {
                // Проверяем, есть ли уже книги в базе
                var existingBooks = await _bookService.GetAllBooksAsync();
                if (existingBooks.Any())
                {
                    _logger.LogInformation("База данных уже содержит книги. Пропускаем начальное наполнение.");
                    return;
                }

                _logger.LogInformation("Начинаем загрузку 100 книг из Google Books API...");

                var allBooks = new List<BookDto>();
                int totalBooksNeeded = 100;
                int booksLoaded = 0;
                int maxRetries = 3;

                // Популярные ключевые слова для поиска разнообразных книг
                var searchKeywords = new[]
                {
                    "fiction", "science", "history", "biography", "fantasy",
                    "romance", "mystery", "programming", "philosophy", "art",
                    "classic literature", "poetry", "cooking", "travel", "science fiction",
                    "business", "psychology", "education", "health", "technology"
                };

                foreach (var keyword in searchKeywords)
                {
                    if (booksLoaded >= totalBooksNeeded)
                        break;

                    for (int retry = 0; retry < maxRetries; retry++)
                    {
                        try
                        {
                            // Ищем книги по ключевому слову
                            var booksFromApi = await FetchBooksFromGoogleApi(keyword);

                            foreach (var apiBook in booksFromApi)
                            {
                                if (booksLoaded >= totalBooksNeeded)
                                    break;

                                var bookDto = MapGoogleBookToDto(apiBook);
                                if (bookDto != null && !string.IsNullOrEmpty(bookDto.Title))
                                {
                                    allBooks.Add(bookDto);
                                    booksLoaded++;
                                    _logger.LogDebug($"Найдена книга {booksLoaded}/{totalBooksNeeded}: {bookDto.Title}");
                                }
                            }

                            if (booksLoaded >= totalBooksNeeded)
                                break;

                            // Задержка для соблюдения лимитов API
                            await Task.Delay(1000);
                            break; // Успешно загрузили, выходим из цикла повторных попыток
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, $"Ошибка при загрузке книг по ключевому слову '{keyword}', попытка {retry + 1}/{maxRetries}");

                            if (retry == maxRetries - 1)
                            {
                                _logger.LogError($"Не удалось загрузить книги по ключевому слову '{keyword}' после {maxRetries} попыток");
                            }
                            else
                            {
                                await Task.Delay(2000 * (retry + 1)); // Увеличиваем задержку при повторных попытках
                            }
                        }
                    }
                }

                _logger.LogInformation($"Успешно загружено {allBooks.Count} книг из API. Начинаем сохранение в базу данных...");

                // Сохраняем книги в базу данных
                int savedCount = 0;
                foreach (var bookDto in allBooks)
                {
                    try
                    {
                        await _bookService.AddOrGetBookAsync(bookDto);
                        savedCount++;

                        if (savedCount % 10 == 0)
                        {
                            _logger.LogInformation($"Сохранено {savedCount}/{allBooks.Count} книг...");
                        }

                        // Задержка для снижения нагрузки на базу данных
                        await Task.Delay(50);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Ошибка при сохранении книги: {bookDto.Title}");
                    }
                }

                _logger.LogInformation($"Начальное наполнение базы данных завершено! Сохранено {savedCount} книг.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Критическая ошибка при начальном наполнении базы данных");
            }
        }

        private async Task<List<GoogleBookItem>> FetchBooksFromGoogleApi(string keyword)
        {
            // Случайный индекс для пагинации (чтобы получать разные книги)
            int startIndex = _random.Next(0, 100);

            var response = await _httpClient.GetAsync($"volumes?q={Uri.EscapeDataString(keyword)}&maxResults=10&startIndex={startIndex}&langRestrict=en,ru");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<GoogleBooksResponse>();
            return result?.Items?.Where(item => item.VolumeInfo != null).ToList() ?? new List<GoogleBookItem>();
        }

        private BookDto? MapGoogleBookToDto(GoogleBookItem googleBook)
        {
            try
            {
                var volumeInfo = googleBook.VolumeInfo;

                // Пропускаем книги без названия или автора
                if (string.IsNullOrEmpty(volumeInfo.Title) ||
                    volumeInfo.Authors == null || !volumeInfo.Authors.Any())
                    return null;

                return new BookDto
                {
                    Title = volumeInfo.Title,
                    Author = string.Join(", ", volumeInfo.Authors),
                    Isbn = volumeInfo.IndustryIdentifiers?
                        .FirstOrDefault(id => id.Type == "ISBN_13" || id.Type == "ISBN_10")?
                        .Identifier ?? string.Empty,
                    CoverUrl = volumeInfo.ImageLinks?.Thumbnail?.Replace("http://", "https://") ??
                               volumeInfo.ImageLinks?.SmallThumbnail?.Replace("http://", "https://") ??
                               string.Empty,
                    Description = volumeInfo.Description ?? "Описание отсутствует",
                    PageCount = volumeInfo.PageCount ?? 0,
                    Publisher = volumeInfo.Publisher ?? "Неизвестный издатель",
                    PublishedDate = ParsePublishedDate(volumeInfo.PublishedDate)
                };
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, $"Ошибка при маппинге книги: {googleBook.VolumeInfo?.Title}");
                return null;
            }
        }

        private DateTime? ParsePublishedDate(string? dateString)
        {
            if (string.IsNullOrEmpty(dateString))
                return null;

            try
            {
                // Google Books API может возвращать даты в формате "YYYY", "YYYY-MM", или "YYYY-MM-DD"
                if (dateString.Length == 4 && int.TryParse(dateString, out int year))
                    return new DateTime(year, 1, 1);

                if (DateTime.TryParse(dateString, out DateTime fullDate))
                    return fullDate;

                return null;
            }
            catch
            {
                return null;
            }
        }

        // Классы для десериализации ответа Google Books API
        private class GoogleBooksResponse
        {
            public List<GoogleBookItem>? Items { get; set; }
        }

        private class GoogleBookItem
        {
            public VolumeInfo? VolumeInfo { get; set; }
        }

        private class VolumeInfo
        {
            public string? Title { get; set; }
            public List<string>? Authors { get; set; }
            public string? Publisher { get; set; }
            public string? PublishedDate { get; set; }
            public string? Description { get; set; }
            public int? PageCount { get; set; }
            public List<IndustryIdentifier>? IndustryIdentifiers { get; set; }
            public ImageLinks? ImageLinks { get; set; }
        }

        private class IndustryIdentifier
        {
            public string? Type { get; set; }
            public string? Identifier { get; set; }
        }

        private class ImageLinks
        {
            public string? SmallThumbnail { get; set; }
            public string? Thumbnail { get; set; }
        }
    }
}