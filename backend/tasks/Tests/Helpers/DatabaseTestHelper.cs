using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Tasks.Data;
using Tasks.Models;
using Tasks.Services;

namespace Tasks.Tests.Helpers;

/// <summary>
/// Helper class for setting up test databases and services.
/// </summary>
public static class DatabaseTestHelper
{
    /// <summary>
    /// Creates an in-memory database context for testing.
    /// </summary>
    public static TasksDbContext CreateInMemoryContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<TasksDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new TasksDbContext(options);
    }

    /// <summary>
    /// Creates a TaskService with an in-memory database and mocked logger.
    /// </summary>
    public static (TaskService service, TasksDbContext context, Mock<ILogger<TaskService>> loggerMock) CreateTaskService(string? databaseName = null)
    {
        var context = CreateInMemoryContext(databaseName);
        var loggerMock = new Mock<ILogger<TaskService>>();
        var service = new TaskService(context, loggerMock.Object);

        return (service, context, loggerMock);
    }

    /// <summary>
    /// Seeds test data into the database context.
    /// </summary>
    public static async Task SeedTestDataAsync(TasksDbContext context)
    {
        var testTasks = new List<TaskEntity>
        {
            new()
            {
                Id = 1,
                Text = "Root Task 1",
                Category = "Work",
                UserId = "user1",
                WidgetId = "widget1",
                Priority = 1,
                DisplayOrder = 1,
                Completed = false,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = 2,
                Text = "Root Task 2",
                Category = "Personal",
                UserId = "user1",
                WidgetId = "widget1",
                Priority = 2,
                DisplayOrder = 2,
                Completed = true,
                DueDate = DateTime.UtcNow.AddDays(5),
                Description = "This is a completed task",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 3,
                Text = "Subtask 1",
                Category = "Work",
                UserId = "user1",
                WidgetId = "widget1",
                ParentTaskId = 1,
                Priority = 3,
                DisplayOrder = 1,
                Completed = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = 4,
                Text = "Task for different user",
                Category = "Work",
                UserId = "user2",
                WidgetId = "widget2",
                Priority = 1,
                DisplayOrder = 1,
                Completed = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 5,
                Text = "Task with different widget",
                Category = "Personal",
                UserId = "user1",
                WidgetId = "widget2",
                Priority = 1,
                DisplayOrder = 1,
                Completed = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Tasks.AddRange(testTasks);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Creates a sample task entity for testing.
    /// </summary>
    public static TaskEntity CreateSampleTask(
        string text = "Sample Task",
        string category = "Test",
        string userId = "testuser",
        string? widgetId = "testwidget",
        bool completed = false,
        int priority = 0,
        DateTime? dueDate = null,
        string? description = null,
        int? parentTaskId = null,
        int displayOrder = 0)
    {
        return new TaskEntity
        {
            Text = text,
            Category = category,
            UserId = userId,
            WidgetId = widgetId,
            Completed = completed,
            Priority = priority,
            DueDate = dueDate,
            Description = description,
            ParentTaskId = parentTaskId,
            DisplayOrder = displayOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
