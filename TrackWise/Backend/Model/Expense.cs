namespace Backend.Models;
public class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public required Category Category { get; set; }
    public required DateTime Date { get; set; }
    public User User { get; set; } = null!;
    public string CategoryId { get; set; }
    public string UserId { get; set; }
}