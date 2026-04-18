namespace IsaretDiliAPI.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; 
        public string Category { get; set; } = string.Empty; 
        public string VideoUrl { get; set; } = string.Empty; 
        
        // 🔥 YENİ: Yapay Zeka Etiketi (Boş olabilir -> string?)
        public string? ModelLabel { get; set; } 

        public bool IsActive { get; set; } = true; 
        public DateTime CreatedAt { get; set; } = DateTime.Now; 
    }
}