using Microsoft.AspNetCore.Http; // IFormFile için gerekli

namespace IsaretDiliAPI.DTOs
{
    public class LessonDto
    {
        // HATA ÇÖZÜMÜ: = string.Empty ekledik.
        public string Title { get; set; } = string.Empty; 
        public string Category { get; set; } = string.Empty;
        
        public IFormFile? VideoFile { get; set; } // Video boş olabilir (güncelleme yaparken)
        public bool IsActive { get; set; }
        
        // 🔥 YENİ: Yapay Zeka Etiketi
        public string? ModelLabel { get; set; }
    }
}