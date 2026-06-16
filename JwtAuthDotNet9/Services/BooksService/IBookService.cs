using booksa.Entities;
using booksa.Models;

namespace booksa.Services.BooksService
{
    public interface IBookService
    {
        // Поиск книг через внешние API
        Task<List<BookDto>> SearchBooksAsync(string query, int maxResults = 10);

        // Добавление книги в БД (если её ещё нет)
        Task<Book> AddOrGetBookAsync(BookDto bookDto);

        // Получение книги по ID
        Task<Book?> GetBookByIdAsync(int id);

        // Получение книги по ISBN
        Task<Book?> GetBookByIsbnAsync(string isbn);

        // Получение всех книг из БД
        Task<List<Book>> GetAllBooksAsync();

        // Получение популярных книг (по количеству рецензий)
        Task<List<Book>> GetPopularBooksAsync(int count = 10);

            // Получить случайные книги
    Task<List<Book>> GetRandomBooksAsync(int count = 12);
    
    // Получить недавно добавленные книги
    Task<List<Book>> GetRecentlyAddedBooksAsync(int count = 10);
    
        // Получить книги с наибольшим количеством рецензий
    Task<List<Book>> GetMostReviewedBooksAsync(int count = 10);

        /// <summary>
        /// Получить список книг из внешнего API (Open Library) по теме или общий список.
        /// </summary>
        Task<List<BookDto>> GetBooksFromExternalApiAsync(string? subject = null, int count = 20);

        /// <summary>
        /// Получить книгу по ID с рецензиями и данными пользователей.
        /// </summary>
        Task<Book?> GetBookByIdWithReviewsAsync(int id);
    }
}
