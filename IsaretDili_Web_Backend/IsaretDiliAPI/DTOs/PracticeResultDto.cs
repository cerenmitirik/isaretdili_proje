namespace IsaretDiliAPI.DTOs
{
    public class PracticeResultDto
    {
        public int UserId { get; set; }
        
        // YENİ EKLENDİ: Frontend buraya dersin ID'sini koyup gönderecek
        public int LessonId { get; set; }

        // Frontend buraya dersin başlığını (Örn: "A Harfi") koyup gönderecek
        public string WorkType { get; set; } = string.Empty; 
        
        public int DurationSeconds { get; set; }
        public int Score { get; set; }
    }
}