using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Data;

public class HostDbContext : DbContext
{
    public HostDbContext(DbContextOptions<HostDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(u => u.Id);
    }
}
