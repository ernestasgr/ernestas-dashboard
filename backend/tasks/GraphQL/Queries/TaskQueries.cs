using FluentValidation;
using HotChocolate;
using HotChocolate.ApolloFederation;
using HotChocolate.ApolloFederation.Resolvers;
using Tasks.GraphQL.Types;
using Tasks.Models;
using Tasks.Services;

namespace Tasks.GraphQL.Queries;

/// <summary>
/// GraphQL query resolver for tasks following SRP.
/// </summary>
public class TaskQueries
{
    /// <summary>
    /// Retrieves tasks with optional filtering.
    /// </summary>
    public async Task<IEnumerable<TaskType>> GetTasksAsync(
        TasksFilterInput? filter,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var tasks = await taskService.GetTasksAsync(
            userId,
            filter?.WidgetId,
            filter?.Category,
            filter?.Completed);

        var filteredTasks = tasks.AsEnumerable();

        if (filter?.DueBefore.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.DueDate.HasValue && t.DueDate <= filter.DueBefore);

        if (filter?.DueAfter.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.DueDate.HasValue && t.DueDate >= filter.DueAfter);

        if (filter?.MinPriority.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.Priority >= filter.MinPriority);

        if (filter?.MaxPriority.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.Priority <= filter.MaxPriority);

        return filteredTasks.Select(MapToTaskType);
    }

    /// <summary>
    /// Retrieves a specific task by ID.
    /// </summary>
    public async Task<TaskType?> GetTaskAsync(
        int id,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";
        var task = await taskService.GetTaskByIdAsync(id, userId);
        return task != null ? MapToTaskType(task) : null;
    }

    /// <summary>
    /// Retrieves all categories used.
    /// </summary>
    public async Task<IEnumerable<string>> GetTaskCategoriesAsync(
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";
        return await taskService.GetCategoriesAsync(userId);
    }

    /// <summary>
    /// Entity resolver for Task federation.
    /// </summary>
    [ReferenceResolver]
    public async Task<TaskType?> ResolveTaskReferenceAsync(
        TaskType taskReference,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";
        var task = await taskService.GetTaskByIdAsync(taskReference.Id, userId);
        return task != null ? MapToTaskType(task) : null;
    }

    /// <summary>
    /// Entity resolver for User federation - extends User with tasks field.
    /// </summary>
    [ReferenceResolver]
    public UserType ResolveUserReference(UserType userReference)
    {
        // Simply return the user reference for federation
        return userReference;
    }

    /// <summary>
    /// Resolves tasks for a user (federation field resolver).
    /// </summary>
    public async Task<IEnumerable<TaskType>> GetTasksForUserAsync(
        [Parent] UserType user,
        TasksFilterInput? filter,
        ITaskService taskService)
    {
        var tasks = await taskService.GetTasksAsync(
            user.Id,
            filter?.WidgetId,
            filter?.Category,
            filter?.Completed);

        var filteredTasks = tasks.AsEnumerable();

        if (filter?.DueBefore.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.DueDate.HasValue && t.DueDate <= filter.DueBefore);

        if (filter?.DueAfter.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.DueDate.HasValue && t.DueDate >= filter.DueAfter);

        if (filter?.MinPriority.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.Priority >= filter.MinPriority);

        if (filter?.MaxPriority.HasValue == true)
            filteredTasks = filteredTasks.Where(t => t.Priority <= filter.MaxPriority);

        return filteredTasks.Select(MapToTaskType);
    }

    /// <summary>
    /// Retrieves the complete task hierarchy (root tasks with their subtasks).
    /// </summary>
    public async Task<IEnumerable<TaskType>> GetTaskHierarchyAsync(
        TasksFilterInput? filter,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var rootTasks = await taskService.GetTaskHierarchyAsync(userId, filter?.WidgetId);

        var filteredTasks = rootTasks.AsEnumerable();

        if (!string.IsNullOrEmpty(filter?.Category))
            filteredTasks = FilterTasksByCategory(filteredTasks, filter.Category);

        if (filter?.Completed.HasValue == true)
            filteredTasks = FilterTasksByCompletion(filteredTasks, filter.Completed.Value);

        if (filter?.DueBefore.HasValue == true)
            filteredTasks = FilterTasksByDueBefore(filteredTasks, filter.DueBefore.Value);

        if (filter?.DueAfter.HasValue == true)
            filteredTasks = FilterTasksByDueAfter(filteredTasks, filter.DueAfter.Value);

        if (filter?.MinPriority.HasValue == true)
            filteredTasks = FilterTasksByMinPriority(filteredTasks, filter.MinPriority.Value);

        if (filter?.MaxPriority.HasValue == true)
            filteredTasks = FilterTasksByMaxPriority(filteredTasks, filter.MaxPriority.Value);

        return filteredTasks.Select(MapToTaskType);
    }

    // Helper methods for recursive filtering
    private static IEnumerable<TaskEntity> FilterTasksByCategory(IEnumerable<TaskEntity> tasks, string category)
    {
        return tasks.Where(t => t.Category == category || t.SubTasks.Any(st => FilterTasksByCategory([st], category).Any()));
    }

    private static IEnumerable<TaskEntity> FilterTasksByCompletion(IEnumerable<TaskEntity> tasks, bool completed)
    {
        return tasks.Where(t => t.Completed == completed || t.SubTasks.Any(st => FilterTasksByCompletion([st], completed).Any()));
    }

    private static IEnumerable<TaskEntity> FilterTasksByDueBefore(IEnumerable<TaskEntity> tasks, DateTime dueBefore)
    {
        return tasks.Where(t => (t.DueDate.HasValue && t.DueDate <= dueBefore) ||
                               t.SubTasks.Any(st => FilterTasksByDueBefore([st], dueBefore).Any()));
    }

    private static IEnumerable<TaskEntity> FilterTasksByDueAfter(IEnumerable<TaskEntity> tasks, DateTime dueAfter)
    {
        return tasks.Where(t => (t.DueDate.HasValue && t.DueDate >= dueAfter) ||
                               t.SubTasks.Any(st => FilterTasksByDueAfter([st], dueAfter).Any()));
    }

    private static IEnumerable<TaskEntity> FilterTasksByMinPriority(IEnumerable<TaskEntity> tasks, int minPriority)
    {
        return tasks.Where(t => t.Priority >= minPriority ||
                               t.SubTasks.Any(st => FilterTasksByMinPriority([st], minPriority).Any()));
    }

    private static IEnumerable<TaskEntity> FilterTasksByMaxPriority(IEnumerable<TaskEntity> tasks, int maxPriority)
    {
        return tasks.Where(t => t.Priority <= maxPriority ||
                               t.SubTasks.Any(st => FilterTasksByMaxPriority([st], maxPriority).Any()));
    }

    private static string? GetUserIdFromContext(IHttpContextAccessor httpContextAccessor)
    {
        var context = httpContextAccessor.HttpContext;
        if (context == null)
            return null;

        var userId = context.Request.Cookies["userId"] ??
                    context.Request.Headers["x-user-id"].FirstOrDefault();

        return userId;
    }

    private static TaskType MapToTaskType(TaskEntity task) => new(
        task.Id,
        task.Text,
        task.Completed,
        task.Category,
        task.UserId,
        task.WidgetId,
        task.CreatedAt,
        task.UpdatedAt,
        task.Priority,
        task.DueDate,
        task.Description,
        task.ParentTaskId,
        task.DisplayOrder,
        task.SubTasks?.Select(MapToTaskType)
    );
}
