using Backend.Models;
namespace Backend.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResult> LoginAsync(LoginRequest request);
    Task<UserProfileResponse?> GetProfileAsync(string username);
    Task<UserProfileResponse?> UpdateProfileAsync(string username, UpdateProfileRequest request);
}
