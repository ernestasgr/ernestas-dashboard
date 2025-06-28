using Microsoft.EntityFrameworkCore;
using Tasks.Models;

namespace Tasks.Data;

/// <summary>
/// Entity Framework database context for tasks.
/// </summary>
public class TasksDbContext : DbContext
{
    public TasksDbContext(DbContextOptions<TasksDbContext> options) : base(options) { }

    public DbSet<TaskEntity> Tasks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.ToTable("tasks");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Text)
                .HasColumnName("text")
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.Completed)
                .HasColumnName("completed")
                .HasDefaultValue(false);

            entity.Property(e => e.Category)
                .HasColumnName("category")
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.WidgetId)
                .HasColumnName("widget_id");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.Priority)
                .HasColumnName("priority")
                .HasDefaultValue(0);

            entity.Property(e => e.DueDate)
                .HasColumnName("due_date");

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasMaxLength(1000);

            entity.Property(e => e.ParentTaskId)
                .HasColumnName("parent_task_id");

            entity.Property(e => e.DisplayOrder)
                .HasColumnName("display_order")
                .HasDefaultValue(0);

            entity.HasOne(e => e.ParentTask)
                .WithMany(e => e.SubTasks)
                .HasForeignKey(e => e.ParentTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId).HasDatabaseName("idx_tasks_user_id");
            entity.HasIndex(e => e.WidgetId).HasDatabaseName("idx_tasks_widget_id");
            entity.HasIndex(e => new { e.UserId, e.Category }).HasDatabaseName("idx_tasks_user_category");
            entity.HasIndex(e => new { e.UserId, e.Completed }).HasDatabaseName("idx_tasks_user_completed");
            entity.HasIndex(e => e.ParentTaskId).HasDatabaseName("idx_tasks_parent_id");
            entity.HasIndex(e => new { e.ParentTaskId, e.DisplayOrder }).HasDatabaseName("idx_tasks_parent_order");
            entity.HasIndex(e => new { e.WidgetId, e.ParentTaskId, e.DisplayOrder }).HasDatabaseName("idx_tasks_widget_hierarchy");
        });
    }
}
