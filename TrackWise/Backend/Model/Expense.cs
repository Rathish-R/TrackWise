namespace Backend.Models;
public class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Category? Category { get; set; }
    public required DateTime Date { get; set; }
    public string CategoryId { get; set; } = string.Empty;
}
