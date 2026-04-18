using Microsoft.AspNetCore.Mvc;
using IsaretDiliAPI.Data;
using IsaretDiliAPI.Entities;
using IsaretDiliAPI.DTOs;
using Microsoft.EntityFrameworkCore;

namespace IsaretDiliAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PracticeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PracticeController(AppDbContext context)
        {
            _context = context;
        }

        // 1. PRATİK KAYDETME (Aynen Kalıyor)
        [HttpPost("add-session")]
        public async Task<IActionResult> AddSession(PracticeResultDto request)
        {
            var session = new PracticeSession
            {
                UserId = request.UserId,
                LessonId = request.LessonId, 
                WorkType = request.WorkType, 
                DurationSeconds = request.DurationSeconds,
                Score = request.Score,
                CreatedAt = DateTime.Now
            };

            _context.PracticeSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok("Pratik kaydedildi.");
        }

        // 2. HAFTALIK GRAFİK VERİSİ (Aynen Kalıyor - Grafik İçin)
        [HttpGet("weekly-stats/{userId}")]
        public async Task<IActionResult> GetWeeklyStats(int userId)
        {
            var sevenDaysAgo = DateTime.Now.AddDays(-7);
            var sessions = await _context.PracticeSessions
                .Where(p => p.UserId == userId && p.CreatedAt >= sevenDaysAgo)
                .ToListAsync();

            var dailyStats = sessions
                .GroupBy(p => p.CreatedAt.DayOfWeek)
                .Select(g => new 
                {
                    Day = g.Key.ToString(),
                    TotalMinutes = g.Sum(x => x.DurationSeconds) / 60,
                    AverageScore = (int)g.Average(x => x.Score)
                });

            return Ok(dailyStats);
        }

        // 3. RAPOR VE PROFIL ÖZETİ (SADECE HAFTALIK VERİ 🔥)
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetUserHistory(int userId)
        {
            var sevenDaysAgo = DateTime.Now.AddDays(-7);

            // A) HAFTALIK VERİLERİ ÇEK
            var weeklySessions = await _context.PracticeSessions
                .Where(p => p.UserId == userId && p.CreatedAt >= sevenDaysAgo)
                .ToListAsync();

            var totalSessions = weeklySessions.Count; // Haftalık Sayı
            var totalSeconds = weeklySessions.Sum(p => p.DurationSeconds); // Haftalık Süre
            
            var weeklyAvg = 0;
            if (totalSessions > 0)
            {
                weeklyAvg = (int)weeklySessions.Average(p => p.Score);
            }

            // NOT: Genel Ortalama (GlobalAvg) tamamen kaldırıldı.

            // B) GEÇMİŞ LİSTESİ (Son Çalışmalar Tablosu İçin)
            // Veritabanından son 100 kaydı çekip RAM'de gruplayalım
            var rawHistory = await _context.PracticeSessions
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(100) 
                .ToListAsync();

            // Aynı Gün + Aynı Ders olanları birleştir (Grupla)
            var groupedHistory = rawHistory
                .GroupBy(p => new { p.WorkType, p.CreatedAt.Date }) 
                .Select(g => new 
                {
                    Id = g.First().Id, 
                    LessonTitle = g.Key.WorkType,
                    Date = g.Key.Date,
                    Score = (int)g.Average(x => x.Score), 
                    DurationSeconds = g.Sum(x => x.DurationSeconds) 
                })
                .OrderByDescending(x => x.Date)
                .Take(5) 
                .ToList();

            return Ok(new 
            {
                History = groupedHistory,
                WeeklySessions = totalSessions,     // Haftalık Toplam Pratik Sayısı
                WeeklyMinutes = totalSeconds / 60,  // Haftalık Toplam Dakika
                WeeklyScore = weeklyAvg             // Haftalık Ortalama Puan
            });
        }
    }
}