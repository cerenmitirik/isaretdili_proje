using Microsoft.AspNetCore.Mvc;
using IsaretDiliAPI.Data;
using IsaretDiliAPI.Entities;
using IsaretDiliAPI.DTOs;
using IsaretDiliAPI.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IsaretDiliAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            var emailAttribute = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (!emailAttribute.IsValid(request.Email))
                return BadRequest("Geçersiz e-posta formatı.");

            string[] allowedDomains = { "gmail.com", "outlook.com", "hotmail.com", "icloud.com", "yandex.com" };
            var domain = request.Email.Split('@').Last().ToLower();
            if (!allowedDomains.Contains(domain))
                return BadRequest("Lütfen geçerli bir e-posta servisi kullanın (Gmail, Outlook vb.).");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Bu e-posta zaten kullanımda.");

            string passwordHash = PasswordHelper.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = passwordHash,
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Kayıt başarılı!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.Password))
                return BadRequest("E-posta veya şifre hatalı.");

            var token = GenerateJwtToken(user);

            // 🔥 GÜNCELLEME: Role bilgisi eklendi
            return Ok(new 
            { 
                Message = "Giriş Başarılı!", 
                Token = token,
                Username = user.Username, 
                UserId = user.Id,
                Role = user.Role // Frontend için gerekli
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest("Kullanıcı bulunamadı.");

            var resetToken = new Random().Next(100000, 999999).ToString();
            user.PasswordResetToken = resetToken;
            user.ResetTokenExpires = DateTime.Now.AddHours(1);

            await _context.SaveChangesAsync();

            try 
            {
                var emailHelper = new EmailHelper(_configuration);
                await emailHelper.SendResetMailAsync(user.Email, resetToken);
                return Ok("Şifre sıfırlama kodu e-posta adresinize gönderildi.");
            }
            catch (Exception ex)
            {
                return BadRequest("Mail gönderilemedi: " + ex.Message);
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordResetToken == request.Token);

            if (user == null || user.ResetTokenExpires < DateTime.Now)
                return BadRequest("Geçersiz veya süresi dolmuş kod.");

            user.Password = PasswordHelper.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpires = null;

            await _context.SaveChangesAsync();
            return Ok("Şifreniz başarıyla güncellendi.");
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "User") 
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}