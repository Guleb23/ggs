namespace booksa.Models
{
    public class ReviewResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsEdited => UpdatedAt.HasValue;

        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }

        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string? BookCoverUrl { get; set; }
    }
}
