namespace Backend.Models;
public class User
{
    public required string Id {get; set;}
    public required string Name {get;set;}
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? Country { get; set; }
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}