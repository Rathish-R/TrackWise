using System.Linq.Expressions;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository;

public class ExpenseRepository : IExpenseRepository
{
    private static readonly IReadOnlyDictionary<string, Expression<Func<Expense, object?>>> ColumnMap =
        new Dictionary<string, Expression<Func<Expense, object?>>>
        {
            ["Id"] = e => e.Id,
            ["Title"] = e => e.Title,
            ["Amount"] = e => e.Amount,
            ["Date"] = e => e.Date,
            ["CategoryId"] = e => e.CategoryId,
            ["CategoryName"] = e => e.Category!.Name,
            ["CategoryIcon"] = e => e.Category!.Icon,
        };

    private readonly AppDbContext _context;
    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Expense>> GetAllAsync()
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .ToListAsync();
    }

    public async Task<Expense?> GetByIdAsync(int id)
    {
        return await _context.Expenses
            .Include(e => e.Category)
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

    public async Task<IEnumerable<ExpenseDto>> GetFilteredAsync(FilterRequest request)
    {
        IQueryable<Expense> query = _context.Expenses;

        query = QueryableFilter.ApplyFilters(query, ColumnMap, request.FilterGroups);

        var projected = QueryableFilter.ApplyProjection<Expense, ExpenseDto>(
            query, ColumnMap, request.Projections);

        return await projected.OrderByDescending(e => e.Date).ToListAsync();
    }

    public async Task<decimal> GetTotalByMonthAsync(int month)
    {
        if (month < 1 || month > 12) return 0m;

        var now = DateTime.Now;
        var start = new DateTime(now.Year, month, 1);
        var end = start.AddMonths(1);

        var total = await _context.Expenses
            .Where(e => e.Date >= start && e.Date < end)
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        return total;
    }
}
