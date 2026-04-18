using Microsoft.AspNetCore.Mvc;
using IsaretDiliAPI.Data;
using IsaretDiliAPI.Entities;
using IsaretDiliAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; 

namespace IsaretDiliAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LessonsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. TÜM DERSLERİ LİSTELE
        [HttpGet]
        [Authorize] 
        public async Task<IActionResult> GetAllLessons()
        {
            // Rol kontrolü: Admin değilse sadece aktifleri görsün
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            IQueryable<Lesson> query = _context.Lessons;

            if (userRole != "Admin")
            {
                query = query.Where(l => l.IsActive == true);
            }

            var lessons = await query
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(lessons);
        }

        // 2. ID'ye GÖRE TEK DERS GETİR
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetLessonById(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null) return NotFound("Ders bulunamadı.");
            return Ok(lesson);
        }

        // 3. YENİ DERS EKLE
        [HttpPost("add")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddLesson([FromForm] LessonDto request)
        {
            string savedVideoUrl = "";
            if (request.VideoFile != null && request.VideoFile.Length > 0)
            {
                try
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "lessons");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(request.VideoFile.FileName);
                    var filePath = Path.Combine(folderPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create)) { await request.VideoFile.CopyToAsync(stream); }
                    savedVideoUrl = "/uploads/lessons/" + fileName;
                }
                catch (Exception ex) { return StatusCode(500, ex.Message); }
            }

            var newLesson = new Lesson
            {
                Title = request.Title,
                Category = request.Category,
                VideoUrl = savedVideoUrl,
                IsActive = request.IsActive,
                // 🔥 DÜZELTME 1: Burası eksikti, artık kaydediliyor.
                ModelLabel = request.ModelLabel, 
                CreatedAt = DateTime.Now
            };

            _context.Lessons.Add(newLesson);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Eklendi", LessonId = newLesson.Id });
        }

        // 4. KATEGORİYE GÖRE GETİR
        [HttpGet("category/{categoryName}")]
        [Authorize]
        public async Task<IActionResult> GetByCategory(string categoryName)
        {
            var lessons = await _context.Lessons
                .Where(l => l.Category == categoryName && l.IsActive == true) 
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
            return Ok(lessons);
        }

        // 5. SİLME
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
             var lesson = await _context.Lessons.FindAsync(id);
             if (lesson == null) return NotFound();
             _context.Lessons.Remove(lesson);
             await _context.SaveChangesAsync();
             return Ok("Silindi");
        }

        // 6. GÜNCELLEME
        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLesson(int id, [FromForm] LessonDto request)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null) return NotFound();

            lesson.Title = request.Title;
            lesson.Category = request.Category;
            lesson.IsActive = request.IsActive;
            
            //  DÜZELTME 2: Burası eksikti, güncelleme yapınca etiket kayboluyordu.
            lesson.ModelLabel = request.ModelLabel; 

            if (request.VideoFile != null && request.VideoFile.Length > 0)
            {
                 // Video güncelleme mantığı...
                 try
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "lessons");
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(request.VideoFile.FileName);
                    var filePath = Path.Combine(folderPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create)) { await request.VideoFile.CopyToAsync(stream); }
                    lesson.VideoUrl = "/uploads/lessons/" + fileName;
                }
                catch (Exception ex) { return StatusCode(500, ex.Message); }
            }
            
            await _context.SaveChangesAsync();
            return Ok(lesson);
        }
    }
}