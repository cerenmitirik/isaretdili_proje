using Microsoft.AspNetCore.Mvc;
using IsaretDiliAPI.Data;
using IsaretDiliAPI.DTOs;
using IsaretDiliAPI.Helpers; // Şifreleme aracı
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // Yetki kontrolü

namespace IsaretDiliAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 DİKKAT: Sadece giriş yapanlar (Token sahibi olanlar) erişebilir
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. KULLANICI BİLGİLERİNİ GETİR (Profil Sayfası İçin)
        // ==========================================
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null) 
                return NotFound("Kullanıcı bulunamadı.");

            // Frontend'e sadece gerekli bilgileri dönüyoruz (Şifreyi asla göndermeyiz!)
            return Ok(new 
            {
                user.Username,
                user.Email,
                user.CreatedAt // Kayıt tarihi
            });
        }

        // ==========================================
        // 2. ŞİFRE DEĞİŞTİRME
        // ==========================================
        [HttpPut("change-password/{userId}")]
        public async Task<IActionResult> ChangePassword(int userId, UpdatePasswordDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            // GÜVENLİK: Eski şifre doğru mu?
            if (!PasswordHelper.VerifyPassword(request.OldPassword, user.Password))
            {
                return BadRequest("Eski şifreniz hatalı.");
            }

            // YENİ ŞİFREYİ HASHLE VE KAYDET
            user.Password = PasswordHelper.HashPassword(request.NewPassword);
            
            await _context.SaveChangesAsync();

            return Ok("Şifreniz başarıyla güncellendi.");
        }

        // ==========================================
        // 3. HESAP SİLME
        // ==========================================
        [HttpDelete("delete-account/{userId}")]
        public async Task<IActionResult> DeleteAccount(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            // ÖNCE: Kullanıcının pratik verilerini siliyoruz (Veritabanı şişmesin)
            var userSessions = _context.PracticeSessions.Where(p => p.UserId == userId);
            _context.PracticeSessions.RemoveRange(userSessions);

            // SONRA: Kullanıcının kendisini siliyoruz
            _context.Users.Remove(user);
            
            await _context.SaveChangesAsync();

            return Ok("Hesabınız ve tüm verileriniz silindi.");
        }
    }
}