namespace Backend.Models;

public enum Operator
{
    Equals,
    NotEquals,
    Contains,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Between,
}

public enum Include
{
    Include,
    Exclude
}

public class FilterGroup
{
    public List<Filter> Filters { get; set; } = new();
}

public class Filter
{
    public string Field { get; set; } = string.Empty;
    public Operator Operator { get; set; }
    public string? Value { get; set; }
    public string? Column { get; set; }
}

public class Projection
{
    public string Column { get; set; } = string.Empty;
    public Include? Include { get; set; }
}

public class FilterRequest
{
    public List<FilterGroup> FilterGroups { get; set; } = new();
    public List<Projection>? Projections { get; set; }
}