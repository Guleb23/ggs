namespace booksa.Entities
{
    public class Review
    {
        public int Id { get; set; }


        public int BookId { get; set; }
        public string UserId { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Book Book { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
