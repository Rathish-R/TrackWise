
using System.Text;
using System.IO;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

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
    var username = currentUser.Username
        ?? throw new InvalidOperationException("No authenticated user for the user database.");
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseSqlite(UserDatabase.ConnectionString(username))
        .Options;
    return new AppDbContext(options);
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"] ?? string.Empty)),
        };
    });
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var hostDb = scope.ServiceProvider.GetRequiredService<HostDbContext>();
    hostDb.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
