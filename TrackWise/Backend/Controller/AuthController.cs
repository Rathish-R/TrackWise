using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var auth = await _authService.RegisterAsync(request);
            return Ok(auth);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result.Error == "UserNotFound")
            return NotFound(new { message = "User does not exist." });
        if (result.Error != null)
            return Unauthorized(new { message = "Invalid password." });
        return Ok(result.Auth);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var username = _currentUserService.Username;
        if (string.IsNullOrWhiteSpace(username))
            return Unauthorized();

        var profile = await _authService.GetProfileAsync(username);
        if (profile == null)
            return NotFound(new { message = "User does not exist." });
        return Ok(profile);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request)
    {
        var username = _currentUserService.Username;
        if (string.IsNullOrWhiteSpace(username))
            return Unauthorized();

        var profile = await _authService.UpdateProfileAsync(username, request);
        if (profile == null)
            return NotFound(new { message = "User does not exist." });
        return Ok(profile);
    }
}
