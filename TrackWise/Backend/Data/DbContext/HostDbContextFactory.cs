using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Data;

public class HostDbContextFactory : IDesignTimeDbContextFactory<HostDbContext>
{
    public HostDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<HostDbContext>()
            .UseSqlite($"Data Source={Path.Combine(Directory.GetCurrentDirectory(), "DB", "host.db")}")
            .Options;
        return new HostDbContext(options);
    }
}
