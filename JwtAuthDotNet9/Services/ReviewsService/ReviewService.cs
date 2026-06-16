using booksa.Data;
using booksa.Entities;
using booksa.Models;
using Microsoft.EntityFrameworkCore;

namespace booksa.Services.ReviewsService
{
    public class ReviewService : IReviewService
    {
        private readonly UserDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(UserDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Review?> CreateAsync(Guid userId, CreateReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5)
            {
                _logger.LogWarning("Invalid rating {Rating}", request.Rating);
                return null;
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                _logger.LogWarning("Empty review content");
                return null;
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return null;
            }

            var bookExists = await _context.Books.AnyAsync(b => b.Id == request.BookId);
            if (!bookExists)
            {
                _logger.LogWarning("Book not found: {BookId}", request.BookId);
                return null;
            }

            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.BookId == request.BookId && r.UserId == userId.ToString());
            if (alreadyReviewed)
            {
                _logger.LogWarning("User already reviewed book {BookId}", request.BookId);
                return null;
            }

            var review = new Review
            {
                BookId = request.BookId,
                UserId = userId.ToString(),
                User = user,
                Content = request.Content.Trim(),
                Rating = request.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Review created for book {BookId} by user {UserId}", request.BookId, userId);
            return review;
        }

        public async Task<List<ReviewResponse>> GetByBookIdAsync(int bookId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<List<ReviewResponse>> GetMyReviewsAsync(Guid userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Book)
                .Where(r => r.UserId == userId.ToString())
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reviews.Select(MapToResponse).ToList();
        }

        public async Task<Review?> UpdateAsync(int reviewId, Guid userId, UpdateReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5 || string.IsNullOrWhiteSpace(request.Content))
                return null;

            var review = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null || review.UserId != userId.ToString())
                return null;

            review.Content = request.Content.Trim();
            review.Rating = request.Rating;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Review {ReviewId} updated by user {UserId}", reviewId, userId);
            return review;
        }

        public async Task<bool> DeleteAsync(int reviewId, Guid userId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null || review.UserId != userId.ToString())
                return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Review {ReviewId} deleted by user {UserId}", reviewId, userId);
            return true;
        }

        public async Task<Review?> GetByIdAsync(int reviewId)
        {
            return await _context.Reviews.FindAsync(reviewId);
        }

        private static ReviewResponse MapToResponse(Review r)
        {
            return new ReviewResponse
            {
                Id = r.Id,
                Content = r.Content,
                Rating = r.Rating,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                UserId = r.UserId,
                UserName = r.User?.Username ?? "",
                UserAvatar = null,
                BookId = r.BookId,
                BookTitle = r.Book?.Title ?? "",
                BookCoverUrl = r.Book?.CoverUrl
            };
        }
    }
}
