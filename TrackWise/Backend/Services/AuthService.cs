using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
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
            new User { Name = string.Empty, Email = string.Empty, PasswordHash = string.Empty },
            request.Password);

        var user = new User
        {
            Name = request.Username,
            Email = request.Email,
            Country = request.Country,
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "$" : request.Currency,
            PasswordHash = hash,
        };

        await _userRepository.AddAsync(user);
        UserDatabase.EnsureCreated(user.Name);
        return CreateAuthResponse(user);
    }

    public async Task<LoginResult> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByNameAsync(request.Username);
        if (user == null)
            return new LoginResult { Error = UserNotFound };

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
            return new LoginResult { Error = InvalidPassword };

        PasswordVerificationResult result;
        try
        {
            result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        }
        catch (FormatException)
        {
            return new LoginResult { Error = InvalidPassword };
        }

        if (result == PasswordVerificationResult.Failed)
            return new LoginResult { Error = InvalidPassword };

        return new LoginResult { Auth = CreateAuthResponse(user) };
    }

    public async Task<UserProfileResponse?> GetProfileAsync(string username)
    {
        var user = await _userRepository.GetByNameAsync(username);
        if (user == null) return null;

        return new UserProfileResponse
        {
            Username = user.Name,
            Email = user.Email,
            Country = user.Country,
            Currency = string.IsNullOrWhiteSpace(user.Currency) ? "$" : user.Currency,
        };
    }

    public async Task<UserProfileResponse?> UpdateProfileAsync(string username, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByNameAsync(username);
        if (user == null) return null;

        user.Country = request.Country;
        user.Currency = string.IsNullOrWhiteSpace(request.Currency) ? "$" : request.Currency;

        await _userRepository.UpdateAsync(user);

        return new UserProfileResponse
        {
            Username = user.Name,
            Email = user.Email,
            Country = user.Country,
            Currency = user.Currency,
        };
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        return new AuthResponse
        {
            Token = GenerateToken(user),
            UserId = user.Id,
            Username = user.Name,
            Email = user.Email,
            Country = user.Country,
            Currency = string.IsNullOrWhiteSpace(user.Currency) ? "$" : user.Currency,
        };
    }

    private string GenerateToken(User user)
    {
        var jwt = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"] ?? string.Empty));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var expiryDays = int.TryParse(jwt["ExpirationDays"], out var days) && days > 0 ? days : 7;
        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
