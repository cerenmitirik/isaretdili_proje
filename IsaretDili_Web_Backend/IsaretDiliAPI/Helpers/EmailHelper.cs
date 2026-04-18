using System.Net;
using System.Net.Mail;

namespace IsaretDiliAPI.Helpers
{
    public class EmailHelper 
    {
        private readonly IConfiguration _configuration;

        public EmailHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendResetMailAsync(string email, string token) 
        {
            // Senin Gmail hesabın ve uygulama şifren
            var myEmail = "cerenmitirik7@gmail.com";
            var myAppPassword = "tihc nrvg ttec mryz";

            var client = new SmtpClient("smtp.gmail.com", 587) 
            {
                Credentials = new NetworkCredential(myEmail, myAppPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(myEmail, "İşaretle Destek"),
                Subject = "Şifre Sıfırlama Kodu",
                // Kullanıcıya gidecek mesaj içeriği
                Body = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #3498db;'>Şifre Sıfırlama Talebi</h2>
                        <p>İşaretle uygulaması şifrenizi sıfırlamak için aşağıdaki 6 haneli kodu kullanın:</p>
                        <div style='background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;'>
                            {token}
                        </div>
                        <p style='color: #777; font-size: 12px; margin-top: 20px;'>
                            Bu talebi siz yapmadıysanız bu e-postayı dikkate almayın. Kod 1 saat boyunca geçerlidir.
                        </p>
                    </div>",
                IsBodyHtml = true
            };
            
            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
        }
    }
}