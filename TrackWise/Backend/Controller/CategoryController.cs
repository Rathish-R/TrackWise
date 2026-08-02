using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService service)
    {
        _categoryService = service;
    }

    [HttpGet]
    public async Task<List<Category>> GetAllCategories()
    {
        return (await _categoryService.GetAllAsync()).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> FindCategoryById(string id)
    {
        var item = await _categoryService.GetByIdAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
    {
        var created = await _categoryService.CreateAsync(category);
        return CreatedAtAction(nameof(FindCategoryById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ReplaceCategory(string id, [FromBody] Category category)
    {
        var ok = await _categoryService.UpdateAsync(id, category);
        if (!ok) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var ok = await _categoryService.DeleteAsync(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}
