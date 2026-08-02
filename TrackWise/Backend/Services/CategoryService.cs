using Backend.Models;
using Backend.Repository;

namespace Backend.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;

    public CategoryService(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        try
        {
            return await _repo.GetAllAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Could not fetch categories.", ex);
        }
    }

    public async Task<Category?> GetByIdAsync(string id)
    {
        if (string.IsNullOrEmpty(id))
            throw new ArgumentException("Id cannot be null or empty.", nameof(id));

        return await _repo.GetByIdAsync(id);
    }

    public Task<Category> CreateAsync(Category category) => _repo.AddAsync(category);

    public async Task<bool> UpdateAsync(string id, Category category)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Name = category.Name;
        existing.Icon = category.Icon;

        await _repo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;
        await _repo.DeleteAsync(existing);
        return true;
    }
}
