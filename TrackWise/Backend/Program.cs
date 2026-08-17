using System.Text;
using System.IO;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
});
builder.Configuration.Sources.Clear();
builder.Configuration
    .AddEnvironmentVariables()
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();

Console.WriteLine($"[CORS] Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"[CORS] Allowed origins: {string.Join(", ", allowedOrigins)}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Backend.Services.ICurrentUserService, Backend.Services.CurrentUserService>();

builder.Services.AddScoped<Backend.Repository.IExpenseRepository, Backend.Repository.ExpenseRepository>();
builder.Services.AddScoped<Backend.Services.IExpenseService, Backend.Services.ExpenseService>();
builder.Services.AddScoped<Backend.Repository.ICategoryRepository, Backend.Repository.CategoryRepository>();
builder.Services.AddScoped<Backend.Services.ICategoryService, Backend.Services.CategoryService>();
builder.Services.AddScoped<Backend.Repository.IUserRepository, Backend.Repository.UserRepository>();
builder.Services.AddScoped<Backend.Services.IAuthService, Backend.Services.AuthService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.Configure<PasswordHasherOptions>(options =>
{
    options.IterationCount = 10_000;
});

// Ensure a centralized DB folder exists and use it for host DB by default
var dbRoot = Path.Combine(Directory.GetCurrentDirectory(), "DB");
Directory.CreateDirectory(dbRoot);

builder.Services.AddDbContext<HostDbContext>(options =>
{
    var hostConnection = builder.Configuration.GetConnectionString("HostConnection")
        ?? $"Data Source={Path.Combine(dbRoot, "host.db")}";
    options.UseSqlite(hostConnection);
});

builder.Services.AddScoped<AppDbContext>(sp =>
{
    var currentUser = sp.GetRequiredService<Backend.Services.ICurrentUserService>();
    var username = currentUser.Username ?? "public";
    UserDatabase.EnsureCreated(username);
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseSqlite(UserDatabase.ConnectionString(username))
        .Options;
    return new AppDbContext(options);
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");
        var jwtKey = jwt["Key"];
        if (builder.Environment.IsProduction() &&
            (string.IsNullOrWhiteSpace(jwtKey) || jwtKey == "TrackWise-Dev-Secret-Key-2026-Change-Me-In-Production"))
        {
            throw new InvalidOperationException(
                "Jwt:Key must be overridden with a strong secret in production (set the Jwt__Key environment variable).");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey ?? string.Empty)),
        };
    });
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Bind to Render's assigned port at runtime, falling back to 8080 locally
var port = Environment.GetEnvironmentVariable("PORT") ?? "5204";
app.Urls.Add($"http://0.0.0.0:{port}");

using (var scope = app.Services.CreateScope())
{
    var hostDb = scope.ServiceProvider.GetRequiredService<HostDbContext>();
    hostDb.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();