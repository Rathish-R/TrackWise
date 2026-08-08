using Backend.Models;

namespace Backend.Data;

public static class DefaultCategories
{
    public static readonly IReadOnlyList<Category> All = new[]
    {
        new Category { Id = "cat1", Name = "Food", Icon = "bi-cup-hot" },
        new Category { Id = "cat2", Name = "Travel", Icon = "bi-car-front" },
        new Category { Id = "cat3", Name = "Bills", Icon = "bi-lightning" },
        new Category { Id = "cat4", Name = "Shopping", Icon = "bi-bag" },
        new Category { Id = "cat5", Name = "Health", Icon = "bi-heart-pulse" },
        new Category { Id = "cat6", Name = "Other", Icon = "bi-three-dots" },
    };
}
