using booksa.Models;
using booksa.Services.ReviewsService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace booksa.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        /// <summary>Создать рецензию на книгу. Только для авторизованных.</summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest("Оценка должна быть от 1 до 5.");

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Текст рецензии не может быть пустым.");

            var review = await _reviewService.CreateAsync(userId.Value, request);
            if (review == null)
                return BadRequest("Книга не найдена или вы уже оставили рецензию на эту книгу.");

            return Ok(new
            {
                Id = review.Id,
                BookId = review.BookId,
                Content = review.Content,
                Rating = review.Rating,
                CreatedAt = review.CreatedAt,
                Message = "Рецензия опубликована и видна всем пользователям."
            });
        }

        /// <summary>Все рецензии по книге — видны всем (включая неавторизованных).</summary>
        [HttpGet("book/{bookId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByBook(int bookId)
        {
            var reviews = await _reviewService.GetByBookIdAsync(bookId);
            return Ok(reviews);
        }

        /// <summary>Мои рецензии. Только для авторизованных.</summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var reviews = await _reviewService.GetMyReviewsAsync(userId.Value);
            return Ok(reviews);
        }

        /// <summary>Обновить свою рецензию.</summary>
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            if (request.Rating < 1 || request.Rating > 5 || string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Оценка от 1 до 5 и непустой текст обязательны.");

            var review = await _reviewService.UpdateAsync(id, userId.Value, request);
            if (review == null)
                return NotFound("Рецензия не найдена или у вас нет прав на её редактирование.");

            return Ok(new
            {
                review.Id,
                review.Content,
                review.Rating,
                review.UpdatedAt
            });
        }

        /// <summary>Удалить свою рецензию.</summary>
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var deleted = await _reviewService.DeleteAsync(id, userId.Value);
            if (!deleted)
                return NotFound("Рецензия не найдена или у вас нет прав на её удаление.");

            return Ok(new { Message = "Рецензия удалена." });
        }

        private Guid? GetCurrentUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }
    }
}
