using Backend.Models;
namespace Backend.Services;
public interface IExpenseService
{
    Task<IEnumerable<Expense>> GetAllAsync();
    Task<Expense?> GetByIdAsync(int id);
    Task<Expense> CreateAsync(Expense expense);
    Task<bool> UpdateAsync(int id, Expense expense);
    Task<bool> DeleteAsync(int id);
}
