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
    public async Task<ActionResult<decimal>> GetAmountByMonth([FromQuery] int? month)
    {
        try
        {
            var m = month.HasValue && month.Value >= 1 && month.Value <= 12 ? month.Value : DateTime.Now.Month;
            var total = await _expenseService.GetTotalByMonthAsync(m);
            return Ok(total);
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500);
        }
    }
}
