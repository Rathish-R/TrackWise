using Backend.Models;
namespace Backend.Repository;

public interface IUserRepository
{
    Task<User?> GetByNameAsync(string name);
    Task<User?> GetByEmailAsync(string email);
    Task<User> AddAsync(User user);
    Task UpdateAsync(User user);
}
