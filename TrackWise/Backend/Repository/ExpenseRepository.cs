using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _context;
    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Expense>> GetAllAsync()
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .Include(e => e.User)
            .ToListAsync();
    }

    public async Task<Expense?> GetByIdAsync(int id)
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Expense> AddAsync(Expense expense)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        return expense;
    }

    public async Task UpdateAsync(Expense expense)
    {
        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Expense expense)
    {
        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
    }
}
