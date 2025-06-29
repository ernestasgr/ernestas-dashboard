using System.ComponentModel.DataAnnotations;

namespace Tasks.Models;

/// <summary>
/// Represents a task entity in the database.
/// </summary>
public class TaskEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(500)]
    public string Text { get; set; } = string.Empty;

    public bool Completed { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    public string? WidgetId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int Priority { get; set; } = 0;

    public DateTime? DueDate { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Parent task ID for hierarchical structure. Null if this is a root task.
    /// </summary>
    public int? ParentTaskId { get; set; }

    /// <summary>
    /// Display order within the same parent/level for drag-and-drop reordering.
    /// </summary>
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Navigation property for parent task.
    /// </summary>
    public TaskEntity? ParentTask { get; set; }

    /// <summary>
    /// Navigation property for child tasks (subtasks).
    /// </summary>
    public ICollection<TaskEntity> SubTasks { get; set; } = new List<TaskEntity>();
}
