namespace Backend.Models;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryIcon { get; set; }
    public DateTime Date { get; set; }
}
