using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class UserDatabase
{
    public static string FileName(string username)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return new string(username.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
    }
    private static string DbRoot => Path.Combine(Directory.GetCurrentDirectory(), "DB");

    public static string ConnectionString(string username)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                  ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                  ?? "Production";
        var prefix = env.Equals("Development", StringComparison.OrdinalIgnoreCase) ? "local_" : "prod_";

        var sanitized = FileName(username);
        var userFolder = Path.Combine(DbRoot, sanitized);
        Directory.CreateDirectory(userFolder);

        var filePath = Path.Combine(userFolder, prefix + sanitized + ".db");
        return $"Data Source={filePath}";
    }

    public static void EnsureCreated(string username)
    {
        // ConnectionString will create the per-user folder if necessary
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(ConnectionString(username))
            .Options;

        using var db = new AppDbContext(options);
        db.Database.EnsureCreated();

        if (!db.Categories.Any())
        {
            db.Categories.AddRange(DefaultCategories.All);
            db.SaveChanges();
        }
    }
}
