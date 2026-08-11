using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller;

[ApiController]
[Authorize]
[Route("api/Dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IExpenseService _expenseService;
    public DashboardController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [AllowAnonymous]
    [HttpGet("getAmountByMonth")]
    public async Task<decimal> GetAmountByMonth([FromQuery] int? month)
    {
        try
        {
            var m = month.HasValue && month.Value >= 1 && month.Value <= 12 ? month.Value : DateTime.Now.Month;
            var total = await _expenseService.GetTotalByMonthAsync(m);
            return total;
        }
        catch (Exception)
        {
            throw;
        }
    }

    [AllowAnonymous]
    [HttpGet("getExpensesByCategory")]
    public async Task<IEnumerable<CategoryAmountDto>> GetExpensesByCategory([FromQuery] int? month)
    {
        try
        {
            var m = month.HasValue && month.Value >= 1 && month.Value <= 12 ? month.Value : DateTime.Now.Month;
            var expenses = await _expenseService.GetExpensesByCategoryAsync(m);
            return expenses;
        }
        catch (Exception)
        {
            throw;
        }
    }

    [AllowAnonymous]
    [HttpGet("getExpensesByMonth")]
    public async Task<IEnumerable<MonthlyAmountDto>> GetExpensesByMonth([FromQuery] int? year)
    {
        try
        {
            var y = year.HasValue && year.Value >= 2000 && year.Value <= 3000 ? year.Value : DateTime.Now.Year;
            return await _expenseService.GetMonthlyTotalsAsync(y);
        }
        catch (Exception)
        {
            throw;
        }
    }
}
