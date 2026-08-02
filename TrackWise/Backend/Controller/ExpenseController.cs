using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller;

[ApiController]
[Authorize]
[Route("api/Expenses")]
public class ExpenseController : ControllerBase
{
    private readonly IExpenseService _service;
    public ExpenseController(IExpenseService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<List<Expense>> GetAllExpenses()
    {
        return (await _service.GetAllAsync()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> FindExpenseById(int id)
    {
        var item = await _service.FindByIdAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense([FromBody] Expense expense)
    {
        var created = await _service.CreateAsync(expense);
        return CreatedAtAction(nameof(FindExpenseById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ReplaceExpense(int id, [FromBody] Expense expense)
    {
        var ok = await _service.UpdateAsync(id, expense);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpenses(int id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpPost("filter")]
    public async Task<List<ExpenseDto>> GetFilteredExpenses([FromBody] FilterRequest filterRequest)
    {
        return (await _service.GetFilteredAsync(filterRequest)).ToList();
    }
}
