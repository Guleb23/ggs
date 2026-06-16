namespace booksa.Entities
{
    public class Book
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? Author { get; set; } 
        public string? Isbn { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
