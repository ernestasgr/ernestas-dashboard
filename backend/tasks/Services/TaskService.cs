using Microsoft.EntityFrameworkCore;
using Tasks.Data;
using Tasks.Models;

namespace Tasks.Services;

/// <summary>
/// Service interface for task operations.
/// </summary>
public interface ITaskService
{
    Task<TaskEntity?> GetTaskByIdAsync(int id, string? userId = null, bool includeSubTasks = false);
    Task<IEnumerable<TaskEntity>> GetTasksAsync(string? userId = null, string? widgetId = null, string? category = null, bool? completed = null, bool includeSubTasks = false, int? parentTaskId = null);
    Task<IEnumerable<TaskEntity>> GetRootTasksAsync(string? userId = null, string? widgetId = null, string? category = null, bool? completed = null);
    Task<TaskEntity> CreateTaskAsync(TaskEntity task);
    Task<TaskEntity?> UpdateTaskAsync(int id, string? userId, Action<TaskEntity> updateAction);
    Task<bool> DeleteTaskAsync(int id, string? userId);
    Task<int> DeleteTasksByWidgetAsync(string widgetId);
    Task<IEnumerable<string>> GetCategoriesAsync(string? userId = null);
    Task<bool> ReorderTaskAsync(int taskId, int newDisplayOrder, int? newParentTaskId, string? userId);
    Task<IEnumerable<TaskEntity>> GetTaskHierarchyAsync(string? userId = null, string? widgetId = null);
}

/// <summary>
/// Service implementation for task operations following SRP.
/// </summary>
public class TaskService : ITaskService
{
    private readonly TasksDbContext _context;
    private readonly ILogger<TaskService> _logger;

    public TaskService(TasksDbContext context, ILogger<TaskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a task by ID, optionally filtered by user.
    /// </summary>
    public async Task<TaskEntity?> GetTaskByIdAsync(int id, string? userId = null, bool includeSubTasks = false)
    {
        try
        {
            var query = _context.Tasks.AsQueryable();

            if (includeSubTasks)
                query = query.Include(t => t.SubTasks);

            query = query.Where(t => t.Id == id);

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.UserId == userId);

            return await query.FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <summary>
    /// Retrieves tasks, optionally filtered by user and other criteria.
    /// </summary>
    public async Task<IEnumerable<TaskEntity>> GetTasksAsync(
        string? userId = null,
        string? widgetId = null,
        string? category = null,
        bool? completed = null,
        bool includeSubTasks = false,
        int? parentTaskId = null)
    {
        try
        {
            var query = _context.Tasks.AsQueryable();

            if (includeSubTasks)
                query = query.Include(t => t.SubTasks);

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.UserId == userId);

            if (!string.IsNullOrEmpty(widgetId))
                query = query.Where(t => t.WidgetId == widgetId);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.Category == category);

            if (completed.HasValue)
                query = query.Where(t => t.Completed == completed.Value);

            if (parentTaskId.HasValue)
                query = query.Where(t => t.ParentTaskId == parentTaskId.Value);

            return await query
                .OrderBy(t => t.DisplayOrder)
                .ThenBy(t => t.Completed)
                .ThenByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Retrieves only root tasks (tasks without parent).
    /// </summary>
    public async Task<IEnumerable<TaskEntity>> GetRootTasksAsync(
        string? userId = null,
        string? widgetId = null,
        string? category = null,
        bool? completed = null)
    {
        return await GetTasksAsync(userId, widgetId, category, completed, includeSubTasks: true, parentTaskId: null);
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    public async Task<TaskEntity> CreateTaskAsync(TaskEntity task)
    {
        try
        {
            task.CreatedAt = DateTime.UtcNow;
            task.UpdatedAt = DateTime.UtcNow;

            // If no display order is specified, put it at the end of its sibling group
            if (task.DisplayOrder == 0)
            {
                var maxOrder = await _context.Tasks
                    .Where(t => t.ParentTaskId == task.ParentTaskId && t.UserId == task.UserId)
                    .MaxAsync(t => (int?)t.DisplayOrder) ?? 0;
                task.DisplayOrder = maxOrder + 1;
            }

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created task {TaskId} for user {UserId} with parent {ParentId}",
                task.Id, task.UserId, task.ParentTaskId);
            return task;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task for user {UserId}", task.UserId);
            throw;
        }
    }

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    public async Task<TaskEntity?> UpdateTaskAsync(int id, string? userId, Action<TaskEntity> updateAction)
    {
        try
        {
            var task = await GetTaskByIdAsync(id, userId, includeSubTasks: false);
            if (task == null)
                return null;

            updateAction(task);
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated task {TaskId} for user {UserId}", id, userId);
            return task;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <summary>
    /// Deletes a task.
    /// </summary>
    public async Task<bool> DeleteTaskAsync(int id, string? userId)
    {
        try
        {
            var task = await GetTaskByIdAsync(id, userId, includeSubTasks: false);
            if (task == null)
                return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted task {TaskId} for user {UserId}", id, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <summary>
    /// Deletes all tasks for a specific widget.
    /// </summary>
    public async Task<int> DeleteTasksByWidgetAsync(string widgetId)
    {
        try
        {
            var tasks = await _context.Tasks
                .Where(t => t.WidgetId == widgetId)
                .ToListAsync();

            if (!tasks.Any())
            {
                _logger.LogInformation("No tasks found for widget {WidgetId}", widgetId);
                return 0;
            }

            _context.Tasks.RemoveRange(tasks);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted {TaskCount} tasks for widget {WidgetId}", tasks.Count, widgetId);
            return tasks.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tasks for widget {WidgetId}", widgetId);
            throw;
        }
    }

    /// <summary>
    /// Retrieves the complete task hierarchy for a user/widget.
    /// </summary>
    public async Task<IEnumerable<TaskEntity>> GetTaskHierarchyAsync(string? userId = null, string? widgetId = null)
    {
        try
        {
            // First, get all tasks that match the criteria (not just root tasks)
            var query = _context.Tasks.AsNoTracking();

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.UserId == userId);

            if (!string.IsNullOrEmpty(widgetId))
                query = query.Where(t => t.WidgetId == widgetId);

            var allTasks = await query
                .OrderBy(t => t.DisplayOrder)
                .ThenBy(t => t.Completed)
                .ThenByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            var taskDict = allTasks.ToDictionary(t => t.Id, t => new TaskEntity
            {
                Id = t.Id,
                Text = t.Text,
                Completed = t.Completed,
                Category = t.Category,
                UserId = t.UserId,
                WidgetId = t.WidgetId,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                Priority = t.Priority,
                DueDate = t.DueDate,
                Description = t.Description,
                ParentTaskId = t.ParentTaskId,
                DisplayOrder = t.DisplayOrder,
                SubTasks = new List<TaskEntity>()
            });

            var rootTasks = new List<TaskEntity>();

            foreach (var originalTask in allTasks)
            {
                var task = taskDict[originalTask.Id];

                if (originalTask.ParentTaskId == null)
                {
                    rootTasks.Add(task);
                }
                else if (taskDict.TryGetValue(originalTask.ParentTaskId.Value, out var parentTask))
                {
                    parentTask.SubTasks.Add(task);
                    task.ParentTask = parentTask;
                }
            }

            SortTasksRecursively(rootTasks);

            return rootTasks;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task hierarchy for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Recursively sorts tasks and their subtasks by display order and other criteria.
    /// </summary>
    private static void SortTasksRecursively(IEnumerable<TaskEntity> tasks)
    {
        foreach (var task in tasks)
        {
            if (task.SubTasks.Count > 0)
            {
                var sortedSubTasks = task.SubTasks
                    .OrderBy(t => t.DisplayOrder)
                    .ThenBy(t => t.Completed)
                    .ThenByDescending(t => t.Priority)
                    .ThenBy(t => t.DueDate)
                    .ThenByDescending(t => t.CreatedAt)
                    .ToList();

                task.SubTasks.Clear();
                foreach (var subtask in sortedSubTasks)
                {
                    task.SubTasks.Add(subtask);
                }

                SortTasksRecursively(task.SubTasks);
            }
        }
    }

    /// <summary>
    /// Reorders a task by updating its display order and optionally moving it to a new parent.
    /// </summary>
    public async Task<bool> ReorderTaskAsync(int taskId, int newDisplayOrder, int? newParentTaskId, string? userId)
    {
        try
        {
            var task = await GetTaskByIdAsync(taskId, userId);
            if (task == null)
                return false;

            if (newParentTaskId.HasValue)
            {
                var newParent = await GetTaskByIdAsync(newParentTaskId.Value, userId) ?? throw new ArgumentException($"Parent task {newParentTaskId} not found or not accessible");

                if (await IsCircularReference(taskId, newParentTaskId.Value))
                    throw new ArgumentException("Cannot move task to its own descendant");
            }

            var oldParentId = task.ParentTaskId;
            var oldDisplayOrder = task.DisplayOrder;

            task.ParentTaskId = newParentTaskId;
            task.DisplayOrder = newDisplayOrder;
            task.UpdatedAt = DateTime.UtcNow;

            await AdjustDisplayOrders(oldParentId, newParentTaskId, oldDisplayOrder, newDisplayOrder, taskId, userId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Reordered task {TaskId} to order {DisplayOrder} under parent {ParentId} for user {UserId}",
                taskId, newDisplayOrder, newParentTaskId, userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering task {TaskId} for user {UserId}", taskId, userId);
            throw;
        }
    }

    /// <summary>
    /// Checks if moving a task to a new parent would create a circular reference.
    /// </summary>
    private async Task<bool> IsCircularReference(int taskId, int newParentTaskId)
    {
        int? currentParent = newParentTaskId;
        while (currentParent.HasValue)
        {
            if (currentParent == taskId)
                return true;

            var parentTask = await _context.Tasks
                .Where(t => t.Id == currentParent.Value)
                .Select(t => new { t.ParentTaskId })
                .FirstOrDefaultAsync();

            currentParent = parentTask?.ParentTaskId;
        }
        return false;
    }

    /// <summary>
    /// Adjusts display orders when a task is moved.
    /// </summary>
    private async Task AdjustDisplayOrders(int? oldParentId, int? newParentId, int oldOrder, int newOrder, int excludeTaskId, string? userId)
    {
        if (oldParentId == newParentId)
        {
            var query = _context.Tasks.Where(t => t.ParentTaskId == oldParentId && t.Id != excludeTaskId);

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.UserId == userId);

            if (oldOrder < newOrder)
            {
                // Moving down: decrease order of tasks between old and new position
                var tasksToUpdate = await query
                    .Where(t => t.DisplayOrder > oldOrder && t.DisplayOrder <= newOrder)
                    .ToListAsync();

                foreach (var task in tasksToUpdate)
                    task.DisplayOrder--;
            }
            else if (oldOrder > newOrder)
            {
                // Moving up: increase order of tasks between new and old position
                var tasksToUpdate = await query
                    .Where(t => t.DisplayOrder >= newOrder && t.DisplayOrder < oldOrder)
                    .ToListAsync();

                foreach (var task in tasksToUpdate)
                    task.DisplayOrder++;
            }
        }
        else
        {
            // Moving to different parent: adjust both old and new parent groups

            // Decrease orders in old parent group for tasks after the removed task
            if (oldParentId.HasValue || oldParentId == null)
            {
                var oldParentQuery = _context.Tasks.Where(t => t.ParentTaskId == oldParentId && t.DisplayOrder > oldOrder);

                if (!string.IsNullOrEmpty(userId))
                    oldParentQuery = oldParentQuery.Where(t => t.UserId == userId);

                var oldParentTasks = await oldParentQuery.ToListAsync();
                foreach (var task in oldParentTasks)
                    task.DisplayOrder--;
            }

            // Increase orders in new parent group for tasks at or after the new position
            if (newParentId.HasValue || newParentId == null)
            {
                var newParentQuery = _context.Tasks.Where(t => t.ParentTaskId == newParentId && t.DisplayOrder >= newOrder);

                if (!string.IsNullOrEmpty(userId))
                    newParentQuery = newParentQuery.Where(t => t.UserId == userId);

                var newParentTasks = await newParentQuery.ToListAsync();
                foreach (var task in newParentTasks)
                    task.DisplayOrder++;
            }
        }
    }

    /// <summary>
    /// Retrieves all categories, optionally filtered by user.
    /// </summary>
    public async Task<IEnumerable<string>> GetCategoriesAsync(string? userId = null)
    {
        try
        {
            var query = _context.Tasks.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.UserId == userId);

            return await query
                .Select(t => t.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories for user {UserId}", userId);
            throw;
        }
    }
}
