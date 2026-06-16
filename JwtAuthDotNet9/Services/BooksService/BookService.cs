using booksa.Data;
using booksa.Entities;
using booksa.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace booksa.Services.BooksService
{
    public class BookService : IBookService
    {
        private readonly UserDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<BookService> _logger;
        private readonly Random _random = new Random();

        public BookService(
            UserDbContext context,
            IHttpClientFactory httpClientFactory,
            ILogger<BookService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<List<BookDto>> SearchBooksAsync(string query, int maxResults = 10)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var encodedQuery = Uri.EscapeDataString(query);
                var url = $"https://openlibrary.org/search.json?q={encodedQuery}&limit={maxResults}";

                _logger.LogInformation($"Searching books with query: {query}");

                var response = await client.GetFromJsonAsync<OpenLibrarySearchResponse>(url);

                if (response?.docs == null || !response.docs.Any())
                {
                    _logger.LogWarning($"No books found for query: {query}");
                    return new List<BookDto>();
                }

                var books = response.docs
                    .Take(maxResults)
                    .Select(doc => new BookDto
                    {
                        Title = doc.title ?? "Неизвестное название",
                        Author = doc.author_name?.FirstOrDefault(),
                        Description = GetDescriptionFromApiData(doc),
                        Isbn = doc.isbn?.FirstOrDefault(),
                        CoverUrl = doc.cover_i != null
                            ? $"https://covers.openlibrary.org/b/id/{doc.cover_i}-M.jpg"
                            : null,
                        PageCount = doc.number_of_pages_median,
                        Publisher = doc.publisher?.FirstOrDefault(),
                        PublishedDate = GetPublishedDate(doc)
                    })
                    .ToList();

                _logger.LogInformation($"Found {books.Count} books for query: {query}");
                return books;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching books for query: {query}");
                return new List<BookDto>();
            }
        }

        public async Task<Book> AddOrGetBookAsync(BookDto bookDto)
        {
            // Сначала ищем по ISBN
            if (!string.IsNullOrEmpty(bookDto.Isbn))
            {
                var existingByIsbn = await _context.Books
                    .FirstOrDefaultAsync(b => b.Isbn == bookDto.Isbn);

                if (existingByIsbn != null)
                {
                    _logger.LogInformation($"Book found by ISBN: {bookDto.Isbn}");
                    return existingByIsbn;
                }
            }

            var existing = await _context.Books
                .FirstOrDefaultAsync(b =>
                    b.Title.ToLower() == bookDto.Title.ToLower() &&
                    b.Author != null && bookDto.Author != null &&
                    b.Author.ToLower() == bookDto.Author.ToLower());

            if (existing != null)
            {
                _logger.LogInformation($"Book found by title and author: {bookDto.Title}");
                return existing;
            }

            var book = new Book
            {
                Title = bookDto.Title,
                Author = bookDto.Author,
                Description = bookDto.Description ?? string.Empty,
                Isbn = bookDto.Isbn,
                CoverUrl = bookDto.CoverUrl,
                AddedAt = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"New book added: {bookDto.Title}");
            return book;
        }

        public async Task<Book?> GetBookByIdAsync(int id)
        {
            return await _context.Books.FindAsync(id);
        }

        public async Task<Book?> GetBookByIdWithReviewsAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Reviews)
                .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<BookDto>> GetBooksFromExternalApiAsync(string? subject = null, int count = 20)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                var topic = string.IsNullOrWhiteSpace(subject) ? "fiction" : subject.Trim().ToLowerInvariant();
                var url = $"https://openlibrary.org/subjects/{Uri.EscapeDataString(topic)}.json?limit={Math.Clamp(count, 1, 50)}";

                _logger.LogInformation("Fetching books from Open Library, subject: {Subject}", topic);

                var response = await client.GetFromJsonAsync<OpenLibrarySubjectResponse>(url);

                if (response?.works == null || !response.works.Any())
                {
                    _logger.LogWarning("No works from Open Library for subject: {Subject}", topic);
                    return new List<BookDto>();
                }

                var books = response.works
                    .Take(count)
                    .Select(w => new BookDto
                    {
                        Title = w.title ?? "Без названия",
                        Author = w.authors?.FirstOrDefault()?.name,
                        CoverUrl = w.cover_id != null
                            ? $"https://covers.openlibrary.org/b/id/{w.cover_id}-M.jpg"
                            : null,
                        Description = null
                    })
                    .ToList();

                _logger.LogInformation("Fetched {Count} books from external API", books.Count);
                return books;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching books from external API, subject: {Subject}", subject);
                return new List<BookDto>();
            }
        }

        public async Task<Book?> GetBookByIsbnAsync(string isbn)
        {
            return await _context.Books
                .FirstOrDefaultAsync(b => b.Isbn == isbn);
        }

        public async Task<List<Book>> GetAllBooksAsync()
        {
            return await _context.Books
                .Include(b => b.Reviews)
                .OrderByDescending(b => b.AddedAt)
                .ToListAsync();
        }

        public async Task<List<Book>> GetPopularBooksAsync(int count = 10)
        {
            return await _context.Books
                .Include(b => b.Reviews)
                .Select(b => new
                {
                    Book = b,
                    ReviewCount = b.Reviews.Count
                })
                .OrderByDescending(x => x.ReviewCount)
                .Take(count)
                .Select(x => x.Book)
                .ToListAsync();
        }

        private string? GetDescriptionFromApiData(OpenLibraryDoc doc)
        {
            if (!string.IsNullOrEmpty(doc.first_sentence?[0]))
                return doc.first_sentence[0];

            return doc.subject?.FirstOrDefault();
        }

        private DateTime? GetPublishedDate(OpenLibraryDoc doc)
        {
            if (doc.first_publish_year.HasValue)
                return new DateTime(doc.first_publish_year.Value, 1, 1);

            return null;
        }
    


        public async Task<List<Book>> GetRandomBooksAsync(int count = 12)
        {
            try
            {
                // Получаем общее количество книг
                var totalBooks = await _context.Books.CountAsync();

                if (totalBooks == 0)
                    return new List<Book>();

                // Если книг меньше запрашиваемого количества, возвращаем все
                if (totalBooks <= count)
                    return await _context.Books
                        .Include(b => b.Reviews)
                        .ToListAsync();

                // Генерируем случайные ID
                var randomIds = new HashSet<int>();
                while (randomIds.Count < count)
                {
                    randomIds.Add(_random.Next(1, totalBooks + 1));
                }

                // Получаем книги по случайным ID
                var books = await _context.Books
                    .Include(b => b.Reviews)
                    .Where(b => randomIds.Contains(b.Id))
                    .ToListAsync();

                // Если некоторые ID не существуют, дополняем список
                if (books.Count < count)
                {
                    var additionalBooks = await _context.Books
                        .Include(b => b.Reviews)
                        .Where(b => !randomIds.Contains(b.Id))
                        .OrderBy(b => Guid.NewGuid()) // Альтернативный способ получения случайных
                        .Take(count - books.Count)
                        .ToListAsync();

                    books.AddRange(additionalBooks);
                }

                return books;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting random books");
                return new List<Book>();
            }
        }

        public async Task<List<Book>> GetRecentlyAddedBooksAsync(int count = 10)
        {
            try
            {
                return await _context.Books
                    .Include(b => b.Reviews)
                    .OrderByDescending(b => b.AddedAt)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recently added books");
                return new List<Book>();
            }
        }

        public async Task<List<Book>> GetMostReviewedBooksAsync(int count = 10)
        {
            try
            {
                return await _context.Books
                    .Include(b => b.Reviews)
                    .Select(b => new
                    {
                        Book = b,
                        ReviewCount = b.Reviews.Count
                    })
                    .OrderByDescending(x => x.ReviewCount)
                    .ThenByDescending(x => x.Book.AddedAt)
                    .Take(count)
                    .Select(x => x.Book)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting most reviewed books");
                return new List<Book>();
            }
        }

        public async Task<List<Book>> GetRecommendedBooksAsync(int count = 12)
        {
            try
            {
                var popularBooks = await GetMostReviewedBooksAsync(count);

                // Если популярных книг достаточно, возвращаем их
                if (popularBooks.Count >= count)
                    return popularBooks.Take(count).ToList();

                // Иначе дополняем случайными книгами
                var randomBooks = await GetRandomBooksAsync(count - popularBooks.Count);

                var result = popularBooks.ToList();
                result.AddRange(randomBooks);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended books");
                return await GetRandomBooksAsync(count); // Fallback на случайные книги
            }
        }
    }

    public class OpenLibrarySubjectResponse
    {
        public string? key { get; set; }
        public string? name { get; set; }
        public List<OpenLibraryWork> works { get; set; } = new();
    }

    public class OpenLibraryWork
    {
        public string? key { get; set; }
        public string? title { get; set; }
        public int? cover_id { get; set; }
        public List<OpenLibraryAuthorRef>? authors { get; set; }
    }

    public class OpenLibraryAuthorRef
    {
        public string? key { get; set; }
        public string? name { get; set; }
    }

    public class OpenLibrarySearchResponse
    {
        public List<OpenLibraryDoc> docs { get; set; } = new();
        public int numFound { get; set; }
    }

    public class OpenLibraryDoc
    {
        public string title { get; set; } = string.Empty;
        public List<string>? author_name { get; set; }
        public List<string>? isbn { get; set; }
        public int? cover_i { get; set; }
        public List<string>? first_sentence { get; set; }
        public List<string>? subject { get; set; }
        public int? first_publish_year { get; set; }
        public int? number_of_pages_median { get; set; }
        public List<string>? publisher { get; set; }
    }
}
