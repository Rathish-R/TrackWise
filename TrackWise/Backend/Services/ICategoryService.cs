using Backend.Models;
namespace Backend.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(string id);
    Task<Category> CreateAsync(Category category);
    Task<bool> UpdateAsync(string id, Category category);
    Task<bool> DeleteAsync(string id);
}
