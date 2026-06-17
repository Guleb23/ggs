using booksa.Entities;
using booksa.Models;
using booksa.Services.BooksService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace booksa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        [HttpGet("random")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRandomBooks([FromQuery] int count = 12)
        {
            if (count < 1 || count > 50)
                return BadRequest("Количество должно быть от 1 до 50");

            try
            {
                var books = await _bookService.GetRandomBooksAsync(count);

                var result = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.CoverUrl,
                    b.Description,
                    ReviewCount = b.Reviews?.Count ?? 0,
                    AverageRating = b.Reviews?.Any() == true
                        ? b.Reviews.Average(r => r.Rating)
                        : 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting random books, count: {count}");
                return StatusCode(500, "Ошибка при получении случайных книг");
            }
        }

        // GET: api/books/most-reviewed
        [HttpGet("most-reviewed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMostReviewedBooks([FromQuery] int count = 10)
        {
            if (count < 1 || count > 50)
                return BadRequest("Количество должно быть от 1 до 50");

            try
            {
                var books = await _bookService.GetMostReviewedBooksAsync(count);

                var result = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.CoverUrl,
                    ReviewCount = b.Reviews?.Count ?? 0,
                    AverageRating = b.Reviews?.Any() == true
                        ? b.Reviews.Average(r => r.Rating)
                        : 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting most reviewed books, count: {count}");
                return StatusCode(500, "Ошибка при получении самых рецензируемых книг");
            }
        }

        // GET: api/books/recommended
        [HttpGet("recommended")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecommendedBooks([FromQuery] int count = 12)
        {
            if (count < 1 || count > 50)
                return BadRequest("Количество должно быть от 1 до 50");

            try
            {
                var books = await _bookService.GetRecentlyAddedBooksAsync(count);

                var result = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.CoverUrl,
                    b.Description,
                    ReviewCount = b.Reviews?.Count ?? 0,
                    AverageRating = b.Reviews?.Any() == true
                        ? b.Reviews.Average(r => r.Rating)
                        : 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting recommended books, count: {count}");
                return StatusCode(500, "Ошибка при получении рекомендованных книг");
            }
        }

        // GET: api/books/homepage - все книги для главной страницы
        [HttpGet("homepage")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHomepageBooks()
        {
            try
            {
                // Получаем разные категории книг параллельно
                var popularTask = _bookService.GetPopularBooksAsync(6);
                var recentTask = _bookService.GetRecentlyAddedBooksAsync(6);
                var randomTask = _bookService.GetRandomBooksAsync(6);

                await Task.WhenAll(popularTask, recentTask, randomTask);

                return Ok(new
                {
                    Popular = popularTask.Result.Select(b => MapToSimpleBook(b)),
                    Recent = recentTask.Result.Select(b => MapToSimpleBook(b)),
                    Random = randomTask.Result.Select(b => MapToSimpleBook(b))
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting homepage books");
                return StatusCode(500, "Ошибка при получении книг для главной страницы");
            }
        }

        private object MapToSimpleBook(Book book)
        {
            return new
            {
                book.Id,
                book.Title,
                book.Author,
                book.CoverUrl,
                ReviewCount = book.Reviews?.Count ?? 0,
                AverageRating = book.Reviews?.Any() == true
                    ? Math.Round(book.Reviews.Average(r => r.Rating), 1)
                    : 0
            };
        }

        /// <summary>Список книг из внешнего API (Open Library) по теме. Без авторизации.</summary>
        [HttpGet("external")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBooksFromExternalApi(
            [FromQuery] string? subject = null,
            [FromQuery] int count = 20)
        {
            if (count < 1 || count > 50)
                return BadRequest("Количество должно быть от 1 до 50.");

            try
            {
                var books = await _bookService.GetBooksFromExternalApiAsync(subject, count);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books from external API");
                return StatusCode(500, "Ошибка при получении списка книг из каталога.");
            }
        }

        // GET: api/books/search?query=
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchBooks([FromQuery] string query, [FromQuery] int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return BadRequest("Поисковый запрос должен содержать минимум 2 символа");
            }

            try
            {
                var books = await _bookService.SearchBooksAsync(query, limit);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching books for query: {query}");
                return StatusCode(500, "Ошибка при поиске книг");
            }
        }

        // POST: api/books/add
        [HttpPost("add")]
        [Authorize] // Только авторизованные пользователи могут добавлять книги
        public async Task<IActionResult> AddBook([FromBody] BookDto bookDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(bookDto.Title))
            {
                return BadRequest("Название книги обязательно");
            }

            try
            {
                var book = await _bookService.AddOrGetBookAsync(bookDto);

                return Ok(new
                {
                    Id = book.Id,
                    Title = book.Title,
                    Author = book.Author,
                    CoverUrl = book.CoverUrl,
                    Message = bookDto.Isbn != null && book.Isbn == bookDto.Isbn
                        ? "Книга найдена в базе"
                        : "Книга добавлена в базу"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding book: {bookDto.Title}");
                return StatusCode(500, "Ошибка при добавлении книги");
            }
        }

        // GET: api/books/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBook(int id)
        {
            try
            {
                var book = await _bookService.GetBookByIdWithReviewsAsync(id);

                if (book == null)
                {
                    return NotFound($"Книга с ID {id} не найдена");
                }

                var reviews = (book.Reviews ?? new List<Review>())
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new ReviewResponse
                    {
                        Id = r.Id,
                        Content = r.Content,
                        Rating = r.Rating,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt,
                        UserId = r.UserId,
                        UserName = r.User?.Username ?? "",
                        UserAvatar = null,
                        BookId = book.Id,
                        BookTitle = book.Title,
                        BookCoverUrl = book.CoverUrl
                    })
                    .ToList();

                return Ok(new BookWithReviewsDto
                {
                    Id = book.Id,
                    Title = book.Title,
                    Author = book.Author,
                    Description = book.Description,
                    CoverUrl = book.CoverUrl,
                    Isbn = book.Isbn,
                    AddedAt = book.AddedAt,
                    ReviewsCount = reviews.Count,
                    AverageRating = reviews.Any() ? reviews.Average(x => x.Rating) : 0,
                    Reviews = reviews
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting book with ID: {id}");
                return StatusCode(500, "Ошибка при получении информации о книге");
            }
        }

        // GET: api/books/isbn/{isbn}
        [HttpGet("isbn/{isbn}")]
        public async Task<IActionResult> GetBookByIsbn(string isbn)
        {
            try
            {
                var book = await _bookService.GetBookByIsbnAsync(isbn);

                if (book == null)
                {
                    return NotFound($"Книга с ISBN {isbn} не найдена");
                }

                return Ok(new
                {
                    Id = book.Id,
                    Title = book.Title,
                    Author = book.Author,
                    CoverUrl = book.CoverUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting book with ISBN: {isbn}");
                return StatusCode(500, "Ошибка при поиске книги по ISBN");
            }
        }

        // GET: api/books
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            try
            {
                var books = await _bookService.GetAllBooksAsync();

                var result = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Description,
                    b.CoverUrl,
                    b.AddedAt,
                    ReviewCount = b.Reviews?.Count ?? 0,
                    AverageRating = b.Reviews?.Any() == true
                        ? Math.Round(b.Reviews.Average(r => r.Rating), 1)
                        : 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all books");
                return StatusCode(500, "Ошибка при получении списка книг");
            }
        }

        // GET: api/books/popular
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularBooks([FromQuery] int count = 10)
        {
            if (count < 1 || count > 50)
            {
                return BadRequest("Количество должно быть от 1 до 50");
            }

            try
            {
                var books = await _bookService.GetPopularBooksAsync(count);

                var result = books.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.CoverUrl,
                    ReviewCount = b.Reviews?.Count ?? 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting popular books, count: {count}");
                return StatusCode(500, "Ошибка при получении популярных книг");
            }
        }

        // GET: api/books/recent
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentBooks([FromQuery] int count = 10)
        {
            if (count < 1 || count > 50)
            {
                return BadRequest("Количество должно быть от 1 до 50");
            }

            try
            {
                var books = await _bookService.GetAllBooksAsync();
                var recentBooks = books.Take(count);

                var result = recentBooks.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.CoverUrl,
                    b.AddedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting recent books, count: {count}");
                return StatusCode(500, "Ошибка при получении последних книг");
            }
        }
    }
}
