using FluentValidation;
using Tasks.GraphQL.Types;

namespace Tasks.Validators;

/// <summary>
/// Validator for task creation input.
/// </summary>
public class CreateTaskInputValidator : AbstractValidator<CreateTaskInput>
{
    public CreateTaskInputValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage("Task text is required")
            .MaximumLength(500)
            .WithMessage("Task text cannot exceed 500 characters");

        RuleFor(x => x.Category)
            .NotEmpty()
            .WithMessage("Category is required")
            .MaximumLength(100)
            .WithMessage("Category cannot exceed 100 characters");

        RuleFor(x => x.Priority)
            .InclusiveBetween(0, 10)
            .WithMessage("Priority must be between 0 and 10");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.AddMinutes(-1))
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.ParentTaskId)
            .GreaterThan(0)
            .WithMessage("Parent task ID must be greater than 0")
            .When(x => x.ParentTaskId.HasValue);

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Display order must be non-negative");
    }
}

/// <summary>
/// Validator for task update input.
/// </summary>
public class UpdateTaskInputValidator : AbstractValidator<UpdateTaskInput>
{
    public UpdateTaskInputValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("Task ID must be greater than 0");

        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage("Task text cannot be empty")
            .MaximumLength(500)
            .WithMessage("Task text cannot exceed 500 characters")
            .When(x => x.Text != null);

        RuleFor(x => x.Category)
            .NotEmpty()
            .WithMessage("Category cannot be empty")
            .MaximumLength(100)
            .WithMessage("Category cannot exceed 100 characters")
            .When(x => x.Category != null);

        RuleFor(x => x.Priority)
            .InclusiveBetween(0, 10)
            .WithMessage("Priority must be between 0 and 10")
            .When(x => x.Priority.HasValue);

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.AddMinutes(-1))
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.ParentTaskId)
            .GreaterThan(0)
            .WithMessage("Parent task ID must be greater than 0")
            .When(x => x.ParentTaskId.HasValue);

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Display order must be non-negative")
            .When(x => x.DisplayOrder.HasValue);
    }
}

/// <summary>
/// Validator for task reordering input.
/// </summary>
public class ReorderTaskInputValidator : AbstractValidator<ReorderTaskInput>
{
    public ReorderTaskInputValidator()
    {
        RuleFor(x => x.TaskId)
            .GreaterThan(0)
            .WithMessage("Task ID must be greater than 0");

        RuleFor(x => x.NewDisplayOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Display order must be non-negative");

        RuleFor(x => x.NewParentTaskId)
            .GreaterThan(0)
            .WithMessage("Parent task ID must be greater than 0")
            .When(x => x.NewParentTaskId.HasValue);
    }
}
