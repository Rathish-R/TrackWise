using Backend.Models;
using Backend.Repository;

namespace Backend.Services;
public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repo;
    public ExpenseService(IExpenseRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<Expense>> GetAllAsync() => _repo.GetAllAsync();

    public Task<Expense?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);

    public Task<Expense> CreateAsync(Expense expense) => _repo.AddAsync(expense);

    public async Task<bool> UpdateAsync(int id, Expense expense)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Title = expense.Title;
        existing.Amount = expense.Amount;
        existing.Date = expense.Date;
        existing.CategoryId = expense.CategoryId;
        existing.UserId = expense.UserId;

        await _repo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;
        await _repo.DeleteAsync(existing);
        return true;
    }
}
