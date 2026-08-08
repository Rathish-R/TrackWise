using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Backend.Services;

public interface ICurrentUserService
{
    string? Username { get; }
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public string? Username =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
        ?? _accessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Name);
}
