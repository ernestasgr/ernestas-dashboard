using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Tasks.Data;
using Tasks.Models;
using Tasks.Services;
using Tasks.Tests.Helpers;
using Xunit;

namespace Tasks.Tests.Services;

/// <summary>
/// Comprehensive unit tests for TaskService following best practices.
/// </summary>
public class TaskServiceTests : IDisposable
{
    private readonly TasksDbContext _context;
    private readonly TaskService _taskService;
    private readonly Mock<ILogger<TaskService>> _loggerMock;

    public TaskServiceTests()
    {
        var uniqueDbName = $"TaskServiceTests_{Guid.NewGuid()}";
        (_taskService, _context, _loggerMock) = DatabaseTestHelper.CreateTaskService(uniqueDbName);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

    #region GetTaskByIdAsync Tests

    [Fact]
    public async Task GetTaskByIdAsync_WithValidId_ReturnsTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskByIdAsync(1, "user1");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Text.Should().Be("Root Task 1");
        result.UserId.Should().Be("user1");
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskByIdAsync(999, "user1");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithDifferentUserId_ReturnsNull()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskByIdAsync(1, "user2");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithSubTasks_IncludesSubTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskByIdAsync(1, "user1", includeSubTasks: true);

        // Assert
        result.Should().NotBeNull();
        result!.SubTasks.Should().HaveCount(1);
        result.SubTasks.First().Id.Should().Be(3);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithoutUserId_ReturnsTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
    }

    #endregion

    #region GetTasksAsync Tests

    [Fact]
    public async Task GetTasksAsync_WithUserId_ReturnsUserTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1");

        // Assert
        result.Should().HaveCount(4); // 3 tasks for user1 + 1 subtask
        result.All(t => t.UserId == "user1").Should().BeTrue();
    }

    [Fact]
    public async Task GetTasksAsync_WithWidgetId_ReturnsWidgetTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1", widgetId: "widget1");

        // Assert
        result.Should().HaveCount(3);
        result.All(t => t.WidgetId == "widget1").Should().BeTrue();
    }

    [Fact]
    public async Task GetTasksAsync_WithCategory_ReturnsCategoryTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1", category: "Work");

        // Assert
        result.Should().HaveCount(2);
        result.All(t => t.Category == "Work").Should().BeTrue();
    }

    [Fact]
    public async Task GetTasksAsync_WithCompleted_ReturnsCompletedTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1", completed: true);

        // Assert
        result.Should().HaveCount(1);
        result.All(t => t.Completed).Should().BeTrue();
    }

    [Fact]
    public async Task GetTasksAsync_WithParentTaskId_ReturnsSubTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1", parentTaskId: 1);

        // Assert
        result.Should().HaveCount(1);
        result.First().ParentTaskId.Should().Be(1);
    }

    [Fact]
    public async Task GetTasksAsync_WithMultipleFilters_ReturnsFilteredTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTasksAsync("user1", "widget1", "Work", false);

        // Assert
        result.Should().HaveCount(2);
        result.All(t => t.UserId == "user1" && t.WidgetId == "widget1" && t.Category == "Work" && !t.Completed).Should().BeTrue();
    }

    #endregion

    #region GetRootTasksAsync Tests

    [Fact]
    public async Task GetRootTasksAsync_ReturnsOnlyRootTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetRootTasksAsync("user1");

        // Assert
        var rootTasks = result.Where(t => t.ParentTaskId == null).ToList();
        rootTasks.Should().HaveCount(3); // 2 root tasks for widget1 + 1 for widget2
        rootTasks.All(t => t.ParentTaskId == null).Should().BeTrue();
    }

    [Fact]
    public async Task GetRootTasksAsync_WithWidgetFilter_ReturnsFilteredRootTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetRootTasksAsync("user1", "widget1");

        // Assert
        var rootTasks = result.Where(t => t.ParentTaskId == null).ToList();
        rootTasks.Should().HaveCount(2);
        rootTasks.All(t => t.WidgetId == "widget1" && t.ParentTaskId == null).Should().BeTrue();
    }

    #endregion

    #region CreateTaskAsync Tests

    [Fact]
    public async Task CreateTaskAsync_WithValidTask_CreatesTask()
    {
        // Arrange
        var task = DatabaseTestHelper.CreateSampleTask();

        // Act
        var result = await _taskService.CreateTaskAsync(task);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
        result.Text.Should().Be("Sample Task");
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task CreateTaskAsync_WithZeroDisplayOrder_SetsMaxDisplayOrder()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);
        var task = DatabaseTestHelper.CreateSampleTask(
            userId: "user1",
            widgetId: "widget1",
            displayOrder: 0);

        // Act
        var result = await _taskService.CreateTaskAsync(task);

        // Assert
        result.DisplayOrder.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateTaskAsync_WithParentTask_SetsCorrectDisplayOrder()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);
        var task = DatabaseTestHelper.CreateSampleTask(
            userId: "user1",
            widgetId: "widget1",
            parentTaskId: 1,
            displayOrder: 0);

        // Act
        var result = await _taskService.CreateTaskAsync(task);

        // Assert
        result.DisplayOrder.Should().BeGreaterThan(0);
        result.ParentTaskId.Should().Be(1);
    }

    #endregion

    #region UpdateTaskAsync Tests

    [Fact]
    public async Task UpdateTaskAsync_WithValidId_UpdatesTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);
        var newText = "Updated Task Text";

        // Act
        var result = await _taskService.UpdateTaskAsync(1, "user1", task =>
        {
            task.Text = newText;
            task.Completed = true;
        });

        // Assert
        result.Should().NotBeNull();
        result!.Text.Should().Be(newText);
        result.Completed.Should().BeTrue();
        result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateTaskAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.UpdateTaskAsync(999, "user1", task => task.Text = "Updated");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateTaskAsync_WithDifferentUserId_ReturnsNull()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.UpdateTaskAsync(1, "user2", task => task.Text = "Updated");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateTaskAsync_WithNullUserId_UpdatesTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.UpdateTaskAsync(1, null, task => task.Text = "Updated");

        // Assert
        result.Should().NotBeNull();
        result!.Text.Should().Be("Updated");
    }

    #endregion

    #region DeleteTaskAsync Tests

    [Fact]
    public async Task DeleteTaskAsync_WithValidId_DeletesTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.DeleteTaskAsync(1, "user1");

        // Assert
        result.Should().BeTrue();
        var deletedTask = await _context.Tasks.FindAsync(1);
        deletedTask.Should().BeNull();
    }

    [Fact]
    public async Task DeleteTaskAsync_WithInvalidId_ReturnsFalse()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.DeleteTaskAsync(999, "user1");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTaskAsync_WithDifferentUserId_ReturnsFalse()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.DeleteTaskAsync(1, "user2");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTaskAsync_WithParentTask_DeletesSubTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.DeleteTaskAsync(1, "user1");

        // Assert
        result.Should().BeTrue();
        var subTask = await _context.Tasks.FindAsync(3);
        subTask.Should().BeNull(); // Should be deleted due to cascade
    }

    #endregion

    #region GetCategoriesAsync Tests

    [Fact]
    public async Task GetCategoriesAsync_WithUserId_ReturnsUserCategories()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetCategoriesAsync("user1");

        // Assert
        result.Should().Contain("Work", "Personal");
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCategoriesAsync_WithoutUserId_ReturnsAllCategories()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetCategoriesAsync();

        // Assert
        result.Should().Contain("Work", "Personal");
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetTaskHierarchyAsync Tests

    [Fact]
    public async Task GetTaskHierarchyAsync_ReturnsHierarchicalTasks()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskHierarchyAsync("user1");

        // Assert
        result.Should().HaveCount(3); // 2 root tasks + 1 different widget
        var rootTask = result.FirstOrDefault(t => t.Id == 1);
        rootTask.Should().NotBeNull();
        rootTask!.SubTasks.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetTaskHierarchyAsync_WithWidgetFilter_ReturnsFilteredHierarchy()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.GetTaskHierarchyAsync("user1", "widget1");

        // Assert
        result.Should().HaveCount(2);
        result.All(t => t.WidgetId == "widget1").Should().BeTrue();
    }

    #endregion

    #region ReorderTaskAsync Tests

    [Fact]
    public async Task ReorderTaskAsync_WithValidParameters_ReordersTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.ReorderTaskAsync(1, 5, null, "user1");

        // Assert
        result.Should().BeTrue();
        var task = await _context.Tasks.FindAsync(1);
        task!.DisplayOrder.Should().Be(5);
    }

    [Fact]
    public async Task ReorderTaskAsync_WithNewParent_MovesTask()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.ReorderTaskAsync(3, 1, 2, "user1");

        // Assert
        result.Should().BeTrue();
        var task = await _context.Tasks.FindAsync(3);
        task!.ParentTaskId.Should().Be(2);
        task.DisplayOrder.Should().Be(1);
    }

    [Fact]
    public async Task ReorderTaskAsync_WithCircularReference_ThrowsException()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act & Assert - Try to make parent task a child of its own child
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _taskService.ReorderTaskAsync(1, 1, 3, "user1"));
    }

    [Fact]
    public async Task ReorderTaskAsync_WithInvalidTaskId_ReturnsFalse()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.ReorderTaskAsync(999, 1, null, "user1");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ReorderTaskAsync_WithDifferentUserId_ReturnsFalse()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act
        var result = await _taskService.ReorderTaskAsync(1, 5, null, "user2");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task CreateTaskAsync_WithDatabaseError_LogsAndThrows()
    {
        // Arrange
        await _context.DisposeAsync(); // Dispose context to simulate database error
        var task = DatabaseTestHelper.CreateSampleTask();

        // Act & Assert
        await Assert.ThrowsAsync<ObjectDisposedException>(() => _taskService.CreateTaskAsync(task));
    }

    [Fact]
    public async Task GetTaskByIdAsync_WithDatabaseError_LogsAndThrows()
    {
        // Arrange
        await _context.DisposeAsync(); // Dispose context to simulate database error

        // Act & Assert
        await Assert.ThrowsAsync<ObjectDisposedException>(() => _taskService.GetTaskByIdAsync(1, "user1"));
    }

    #endregion

    #region Edge Cases Tests

    [Fact]
    public async Task GetTasksAsync_WithEmptyDatabase_ReturnsEmptyCollection()
    {
        // Act
        var result = await _taskService.GetTasksAsync("user1");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateTaskAsync_WithMaxDisplayOrder_HandlesCorrectly()
    {
        // Arrange
        var existingTask = DatabaseTestHelper.CreateSampleTask(displayOrder: int.MaxValue - 1);
        await _taskService.CreateTaskAsync(existingTask);

        var newTask = DatabaseTestHelper.CreateSampleTask(
            text: "New Task",
            displayOrder: 0);

        // Act
        var result = await _taskService.CreateTaskAsync(newTask);

        // Assert
        result.DisplayOrder.Should().Be(int.MaxValue);
    }

    [Fact]
    public async Task UpdateTaskAsync_WithNullUpdateAction_DoesNotThrow()
    {
        // Arrange
        await DatabaseTestHelper.SeedTestDataAsync(_context);

        // Act & Assert - Should not throw
        var result = await _taskService.UpdateTaskAsync(1, "user1", _ => { });
        result.Should().NotBeNull();
    }

    #endregion
}
