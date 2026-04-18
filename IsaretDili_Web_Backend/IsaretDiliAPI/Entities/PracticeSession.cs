namespace IsaretDiliAPI.Entities
{
    public class PracticeSession
    {
        public int Id { get; set; }

        public int UserId { get; set; } 

        // YENİ EKLENDİ: Hangi ders çalışıldı? (Örn: 5)
        public int LessonId { get; set; } 

        // Buraya artık "Harfler" yerine "A Harfi" gibi spesifik başlık yazılacak
        public string WorkType { get; set; } = string.Empty; 

        public int DurationSeconds { get; set; } 

        public int Score { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now; 
    }
}