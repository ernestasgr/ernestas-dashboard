using HotChocolate;
using HotChocolate.ApolloFederation;
using HotChocolate.ApolloFederation.Types;

namespace Tasks.GraphQL.Types;

/// <summary>
/// GraphQL input type for creating a new task.
/// </summary>
public record CreateTaskInput(
    string Text,
    string Category,
    string? WidgetId = null,
    int Priority = 0,
    DateTime? DueDate = null,
    string? Description = null,
    int? ParentTaskId = null,
    int DisplayOrder = 0
);

/// <summary>
/// GraphQL input type for updating an existing task.
/// </summary>
public record UpdateTaskInput(
    int Id,
    string? Text = null,
    bool? Completed = null,
    string? Category = null,
    int? Priority = null,
    DateTime? DueDate = null,
    string? Description = null,
    int? ParentTaskId = null,
    int? DisplayOrder = null
);

/// <summary>
/// GraphQL input type for reordering tasks.
/// </summary>
public record ReorderTaskInput(
    int TaskId,
    int NewDisplayOrder,
    int? NewParentTaskId = null
);

/// <summary>
/// GraphQL input type for filtering tasks.
/// </summary>
public record TasksFilterInput(
    string? WidgetId = null,
    string? Category = null,
    bool? Completed = null,
    DateTime? DueBefore = null,
    DateTime? DueAfter = null,
    int? MinPriority = null,
    int? MaxPriority = null
);

/// <summary>
/// GraphQL type representing a task with Apollo Federation support.
/// </summary>
[Key("id")]
public record TaskType(
    [property: ID] int Id,
    string Text,
    bool Completed,
    string Category,
    string UserId,
    string? WidgetId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int Priority,
    DateTime? DueDate,
    string? Description,
    int? ParentTaskId,
    int DisplayOrder,
    IEnumerable<TaskType>? SubTasks = null
);

/// <summary>
/// User reference type for federation.
/// </summary>
[Key("id")]
[ExtendServiceType]
public record UserType([property: ID] string Id);
