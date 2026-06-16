using booksa.Entities;
using booksa.Models;

namespace booksa.Services.ReviewsService
{
    public interface IReviewService
    {
        /// <summary>Создать рецензию (только авторизованный пользователь).</summary>
        Task<Review?> CreateAsync(Guid userId, CreateReviewRequest request);

        /// <summary>Рецензии по книге — видны всем.</summary>
        Task<List<ReviewResponse>> GetByBookIdAsync(int bookId);

        /// <summary>Рецензии текущего пользователя.</summary>
        Task<List<ReviewResponse>> GetMyReviewsAsync(Guid userId);

        /// <summary>Обновить свою рецензию.</summary>
        Task<Review?> UpdateAsync(int reviewId, Guid userId, UpdateReviewRequest request);

        /// <summary>Удалить свою рецензию.</summary>
        Task<bool> DeleteAsync(int reviewId, Guid userId);

        /// <summary>Одна рецензия по ID (для проверки прав).</summary>
        Task<Review?> GetByIdAsync(int reviewId);
    }
}
