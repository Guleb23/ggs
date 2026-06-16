namespace booksa.Models
{
    public class BookDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Author { get; set; }
        public string? Description { get; set; }
        public string? Isbn { get; set; }
        public string? CoverUrl { get; set; }
        public int? PageCount { get; set; }
        public string? Publisher { get; set; }
        public DateTime? PublishedDate { get; set; }
    }

    public class BookWithReviewsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Author { get; set; }
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public DateTime AddedAt { get; set; }

        // Статистика
        public int ReviewsCount { get; set; }
        public double AverageRating { get; set; }

        // Рецензии
        public List<ReviewResponse> Reviews { get; set; } = new();
    }
}
