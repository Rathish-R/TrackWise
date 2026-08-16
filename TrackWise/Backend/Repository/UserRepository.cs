using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository;

public class UserRepository : IUserRepository
{
    private readonly HostDbContext _context;
    public UserRepository(HostDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByNameAsync(string name)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Name == name);
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}
