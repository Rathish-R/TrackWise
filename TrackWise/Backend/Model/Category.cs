namespace Backend.Models;
public class Category
{
    public required string Id {get;set;}
    public required string Name {get;set;}
    public string? Icon { get; set; }
    public string? UserId { get; set; }
    public User? User { get; set; }
}