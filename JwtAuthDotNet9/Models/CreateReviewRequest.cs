namespace booksa.Models
{
    public class CreateReviewRequest
    {
        public int BookId { get; set; }
        public string Content { get; set; } = string.Empty;
        /// <summary>Оценка от 1 до 5.</summary>
        public int Rating { get; set; }
    }

    public class UpdateReviewRequest
    {
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
    }
}
