using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;
using Backend.Models;

namespace Backend.Repository;

public static class QueryableFilter
{
    public static IQueryable<T> ApplyFilters<T>(
        IQueryable<T> query,
        IReadOnlyDictionary<string, Expression<Func<T, object?>>> columnMap,
        List<FilterGroup> groups)
    {
        if (groups is not { Count: > 0 }) return query;

        var parameter = Expression.Parameter(typeof(T), "e");
        Expression? orBody = null;

        foreach (var group in groups)
        {
            if (group.Filters is not { Count: > 0 }) continue;

            Expression? andBody = null;
            foreach (var filter in group.Filters)
            {
                var body = BuildCondition(columnMap, parameter, filter);
                andBody = andBody == null ? body : Expression.AndAlso(andBody, body);
            }

            if (andBody == null) continue;
            orBody = orBody == null ? andBody : Expression.OrElse(orBody, andBody);
        }

        if (orBody == null) return query;
        return query.Where(Expression.Lambda<Func<T, bool>>(orBody, parameter));
    }

    public static IQueryable<TResult> ApplyProjection<T, TResult>(
        IQueryable<T> query,
        IReadOnlyDictionary<string, Expression<Func<T, object?>>> columnMap,
        List<Projection>? projections)
    {
        var parameter = Expression.Parameter(typeof(T), "e");
        var sourceParameter = columnMap.Values.First().Parameters[0];
        var targetProperties = typeof(TResult).GetProperties();

        var bindings = new List<MemberBinding>();
        if (projections is not { Count: > 0 })
        {
            foreach (var entry in columnMap)
            {
                var binding = BuildBinding(targetProperties, entry.Value, sourceParameter, parameter, entry.Key);
                if (binding != null) bindings.Add(binding);
            }
        }
        else
        {
            foreach (var projection in projections)
            {
                if (projection.Include == Include.Exclude) continue;
                if (!columnMap.TryGetValue(projection.Column, out var column)) continue;

                var binding = BuildBinding(targetProperties, column, sourceParameter, parameter, projection.Column);
                if (binding != null) bindings.Add(binding);
            }
        }

        if (bindings.Count == 0)
        {
            var empty = Expression.Lambda<Func<T, TResult>>(Expression.New(typeof(TResult)), parameter);
            return query.Select(empty);
        }

        var memberInit = Expression.MemberInit(Expression.New(typeof(TResult)), bindings);
        var select = Expression.Lambda<Func<T, TResult>>(memberInit, parameter);
        return query.Select(select);
    }

    private static Expression BuildCondition<T>(
        IReadOnlyDictionary<string, Expression<Func<T, object?>>> columnMap,
        ParameterExpression parameter,
        Filter filter)
    {
        if (!columnMap.TryGetValue(filter.Field, out var column))
            throw new InvalidOperationException($"Unsupported filter field '{filter.Field}'");

        var member = ReplaceParameter(UnwrapMember(column.Body), column.Parameters[0], parameter);
        var memberType = member.Type;

        if (filter.Operator == Operator.Between)
        {
            var from = Expression.Constant(ParseValue(memberType, filter.Value), memberType);
            var to = Expression.Constant(ParseValue(memberType, filter.Column ?? filter.Value), memberType);
            return Expression.AndAlso(
                Expression.GreaterThanOrEqual(member, from),
                Expression.LessThanOrEqual(member, to));
        }

        var value = Expression.Constant(ParseValue(memberType, filter.Value), memberType);
        return BuildComparison(member, memberType, filter, value);
    }

    private static Expression BuildComparison(
        Expression member,
        Type memberType,
        Filter filter,
        ConstantExpression value)
    {
        if (memberType == typeof(string))
        {
            return filter.Operator switch
            {
                Operator.Equals => Expression.Equal(member, value),
                Operator.NotEquals => Expression.NotEqual(member, value),
                Operator.Contains => Expression.Call(member, nameof(string.Contains), null, value),
                _ => throw new InvalidOperationException(
                    $"Operator '{filter.Operator}' is not valid for string field '{filter.Field}'"),
            };
        }

        return filter.Operator switch
        {
            Operator.Equals => Expression.Equal(member, value),
            Operator.NotEquals => Expression.NotEqual(member, value),
            Operator.GreaterThan => Expression.GreaterThan(member, value),
            Operator.GreaterThanOrEqual => Expression.GreaterThanOrEqual(member, value),
            Operator.LessThan => Expression.LessThan(member, value),
            Operator.LessThanOrEqual => Expression.LessThanOrEqual(member, value),
            _ => throw new InvalidOperationException(
                $"Operator '{filter.Operator}' is not valid for field '{filter.Field}'"),
        };
    }

    private static MemberBinding? BuildBinding<T>(
        PropertyInfo[] targetProperties,
        Expression<Func<T, object?>> column,
        ParameterExpression sourceParameter,
        ParameterExpression parameter,
        string fieldName)
    {
        var target = targetProperties.FirstOrDefault(p =>
            p.Name.Equals(fieldName, StringComparison.OrdinalIgnoreCase));
        if (target == null) return null;

        var member = ReplaceParameter(UnwrapMember(column.Body), sourceParameter, parameter);
        if (member.Type != target.PropertyType)
            member = Expression.Convert(member, target.PropertyType);

        return Expression.Bind(target, member);
    }

    private static Expression ReplaceParameter(
        Expression expression,
        ParameterExpression oldParameter,
        ParameterExpression newParameter)
    {
        return new ParameterReplacer(oldParameter, newParameter).Visit(expression);
    }

    private static Expression UnwrapMember(Expression body) =>
        body is UnaryExpression { NodeType: ExpressionType.Convert } unary ? unary.Operand : body;

    private static object ParseValue(Type memberType, string? raw)
    {
        if (raw == null)
            throw new InvalidOperationException("Filter value cannot be null.");

        try
        {
            if (memberType == typeof(string)) return raw;
            if (memberType == typeof(int)) return int.Parse(raw, CultureInfo.InvariantCulture);
            if (memberType == typeof(decimal))
                return decimal.Parse(raw, NumberStyles.Any, CultureInfo.InvariantCulture);
            if (memberType == typeof(DateTime))
                return DateTime.Parse(raw, CultureInfo.InvariantCulture, DateTimeStyles.None);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Invalid value '{raw}' for filter.", ex);
        }

        throw new InvalidOperationException($"Unsupported filter column type '{memberType}'.");
    }

    private sealed class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _old;
        private readonly ParameterExpression _new;

        public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _old = oldParameter;
            _new = newParameter;
        }

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _old ? _new : base.VisitParameter(node);
    }
}
