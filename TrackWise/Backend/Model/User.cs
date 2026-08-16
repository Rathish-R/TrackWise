namespace Backend.Models;
public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? Country { get; set; }
    public string Theme { get; set; } = "default";
    public string Language { get; set; } = "en";
    public string Currency { get; set; } = "$";
}
