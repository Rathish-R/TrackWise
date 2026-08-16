using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class RegisterRequest
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Country { get; set; }
    public string? Currency { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string Currency { get; set; } = "$";
}

public class UpdateProfileRequest
{
    public string? Country { get; set; }
    public string? Currency { get; set; }
}

public class UserProfileResponse
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string Currency { get; set; } = "$";
}

public class LoginResult
{
    public AuthResponse? Auth { get; set; }
    public string? Error { get; set; }
}
