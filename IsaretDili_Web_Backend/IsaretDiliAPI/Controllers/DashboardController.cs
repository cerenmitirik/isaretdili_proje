using Microsoft.AspNetCore.Mvc;
using IsaretDiliAPI.Data;
using Microsoft.EntityFrameworkCore;
using IsaretDiliAPI.DTOs;

namespace IsaretDiliAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary/{userId}")]
        public async Task<IActionResult> GetDashboardSummary(int userId)
        {
            // 0. KULLANICI ADINI BUL
            var user = await _context.Users.FindAsync(userId);
            string realName = user != null ? user.Username : "Öğrenci"; 

            var today = DateTime.Today; // Bugünün başlangıcı (00:00)

            // 1. GÜNLÜK ÇALIŞMA SÜRESİ (Sadece Bugün)
            var dailySeconds = await _context.PracticeSessions
                .Where(p => p.UserId == userId && p.CreatedAt >= today)
                .SumAsync(p => p.DurationSeconds);
            
            var dailyMinutes = dailySeconds / 60;

            // 2. GÜNLÜK ORTALAMA SKOR (Sadece Bugün) - YENİ MANTIK
            var dailySessions = await _context.PracticeSessions
                .Where(p => p.UserId == userId && p.CreatedAt >= today)
                .ToListAsync();

            var dailyScore = dailySessions.Any() ? (int)dailySessions.Average(p => p.Score) : 0;

            // 3. GÜNÜN DERSİ
            var activeLessons = await _context.Lessons.Where(l => l.IsActive).ToListAsync();
            object? dailyLesson = null;

            if (activeLessons.Any())
            {
                int seed = DateTime.Now.Year * 10000 + DateTime.Now.DayOfYear;
                var rnd = new Random(seed);
                int randomIndex = rnd.Next(activeLessons.Count);
                
                var selectedLesson = activeLessons[randomIndex];
                dailyLesson = new { selectedLesson.Id, selectedLesson.Title, selectedLesson.VideoUrl, selectedLesson.Category };
            }

            // 4. SON AKTİVİTE
            var lastActivity = await _context.PracticeSessions
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new { 
                    Title = p.WorkType, 
                    Date = p.CreatedAt,
                    Score = p.Score
                })
                .FirstOrDefaultAsync();

            // 5. YENİ EKLENEN DERS
            var lastAddedLesson = await _context.Lessons
                .Where(l => l.IsActive)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new { 
                    l.Id,
                    l.Title, 
                    l.Category, 
                    l.CreatedAt, 
                    l.VideoUrl 
                }) 
                .FirstOrDefaultAsync();

            return Ok(new
            {
                UserName = realName,
                DailyMinutes = dailyMinutes, // Dashboard'da "Süre" kutusu için
                DailyScore = dailyScore,     // Dashboard'da "Başarı" kutusu için
                DailyLesson = dailyLesson,
                LastActivity = lastActivity,
                LastAddedLesson = lastAddedLesson
            });
        }
    }
}