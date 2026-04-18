using Microsoft.EntityFrameworkCore;
using IsaretDiliAPI.Entities;

namespace IsaretDiliAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
       public DbSet<PracticeSession> PracticeSessions { get; set; }
       public DbSet<Lesson> Lessons { get; set; }
    
    }
}