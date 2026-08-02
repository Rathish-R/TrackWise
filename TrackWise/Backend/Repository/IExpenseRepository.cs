using Backend.Models;
namespace Backend.Repository;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> GetAllAsync();
    Task<Expense?> GetByIdAsync(int id);
    Task<Expense> AddAsync(Expense expense);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(Expense expense);
    Task<IEnumerable<ExpenseDto>> GetFilteredAsync(FilterRequest request);
}
