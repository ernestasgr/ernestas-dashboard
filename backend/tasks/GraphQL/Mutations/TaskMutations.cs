using FluentValidation;
using HotChocolate;
using Tasks.GraphQL.Types;
using Tasks.Models;
using Tasks.Services;
using Tasks.Validators;

namespace Tasks.GraphQL.Mutations;

/// <summary>
/// GraphQL mutation resolver for tasks following SRP.
/// </summary>
public class TaskMutations
{
    /// <summary>
    /// Creates a new task.
    /// </summary>
    public async Task<TaskType> CreateTaskAsync(
        CreateTaskInput input,
        ITaskService taskService,
        IValidator<CreateTaskInput> validator,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var validationResult = await validator.ValidateAsync(input);
        if (!validationResult.IsValid)
        {
            var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new ArgumentException($"Validation failed: {errors}");
        }

        var task = new TaskEntity
        {
            Text = input.Text,
            Category = input.Category,
            UserId = userId,
            WidgetId = input.WidgetId,
            Priority = input.Priority,
            DueDate = input.DueDate,
            Description = input.Description,
            ParentTaskId = input.ParentTaskId,
            DisplayOrder = input.DisplayOrder,
            Completed = false
        };

        var createdTask = await taskService.CreateTaskAsync(task);
        return MapToTaskType(createdTask);
    }

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    public async Task<TaskType?> UpdateTaskAsync(
        UpdateTaskInput input,
        ITaskService taskService,
        IValidator<UpdateTaskInput> validator,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var validationResult = await validator.ValidateAsync(input);
        if (!validationResult.IsValid)
        {
            var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new ArgumentException($"Validation failed: {errors}");
        }

        var updatedTask = await taskService.UpdateTaskAsync(input.Id, userId, task =>
        {
            if (input.Text != null) task.Text = input.Text;
            if (input.Completed.HasValue) task.Completed = input.Completed.Value;
            if (input.Category != null) task.Category = input.Category;
            if (input.Priority.HasValue) task.Priority = input.Priority.Value;
            if (input.DueDate.HasValue) task.DueDate = input.DueDate.Value;
            if (input.Description != null) task.Description = input.Description;
            if (input.ParentTaskId.HasValue) task.ParentTaskId = input.ParentTaskId.Value;
            if (input.DisplayOrder.HasValue) task.DisplayOrder = input.DisplayOrder.Value;
        });

        return updatedTask != null ? MapToTaskType(updatedTask) : null;
    }

    /// <summary>
    /// Toggles the completion status of a task.
    /// </summary>
    public async Task<TaskType?> ToggleTaskCompletionAsync(
        int id,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var updatedTask = await taskService.UpdateTaskAsync(id, userId, task =>
        {
            task.Completed = !task.Completed;
        });

        return updatedTask != null ? MapToTaskType(updatedTask) : null;
    }

    /// <summary>
    /// Deletes a task.
    /// </summary>
    public async Task<bool> DeleteTaskAsync(
        int id,
        ITaskService taskService,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";
        return await taskService.DeleteTaskAsync(id, userId);
    }

    /// <summary>
    /// Reorders a task by changing its display order and optionally moving it to a new parent.
    /// </summary>
    public async Task<TaskType?> ReorderTaskAsync(
        ReorderTaskInput input,
        ITaskService taskService,
        IValidator<ReorderTaskInput> validator,
        IHttpContextAccessor httpContextAccessor)
    {
        var userId = GetUserIdFromContext(httpContextAccessor) ?? "anonymous";

        var validationResult = await validator.ValidateAsync(input);
        if (!validationResult.IsValid)
        {
            var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new ArgumentException($"Validation failed: {errors}");
        }

        var success = await taskService.ReorderTaskAsync(
            input.TaskId,
            input.NewDisplayOrder,
            input.NewParentTaskId,
            userId);

        if (!success)
            return null;

        var updatedTask = await taskService.GetTaskByIdAsync(input.TaskId, userId);
        return updatedTask != null ? MapToTaskType(updatedTask) : null;
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
