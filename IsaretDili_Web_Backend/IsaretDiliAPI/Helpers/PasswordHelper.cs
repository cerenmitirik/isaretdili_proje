namespace IsaretDiliAPI.Helpers
{
    public static class PasswordHelper
    {
        // Şifreyi karmakarışık hale getirir (Hash'ler)
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Girilen şifre ile veritabanındaki karmaşık şifre aynı mı bakar
        public static bool VerifyPassword(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
    }
}