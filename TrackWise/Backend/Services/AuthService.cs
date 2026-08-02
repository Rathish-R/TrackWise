using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Backend.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private const string UserNotFound = "UserNotFound";
    private const string InvalidPassword = "InvalidPassword";

    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        IPasswordHasher<User> passwordHasher)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.GetByNameAsync(request.Username) != null)
            throw new InvalidOperationException("Username already exists.");

        if (await _userRepository.GetByEmailAsync(request.Email) != null)
            throw new InvalidOperationException("Email already exists.");

        var hash = _passwordHasher.HashPassword(
            new User { Id = string.Empty, Name = string.Empty, Email = string.Empty, PasswordHash = string.Empty },
            request.Password);

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Username,
            Email = request.Email,
            Country = request.Country,
            PasswordHash = hash,
        };

        await _userRepository.AddAsync(user);
        return CreateAuthResponse(user);
    }

    public async Task<LoginResult> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByNameAsync(request.Username);
        if (user == null)
            return new LoginResult { Error = UserNotFound };

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            return new LoginResult { Error = InvalidPassword };

        return new LoginResult { Auth = CreateAuthResponse(user) };
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        return new AuthResponse
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Username = user.Name,
            Email = user.Email,
        };
    }

    private string GenerateToken(User user)
    {
        var jwt = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"] ?? string.Empty));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: null,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
