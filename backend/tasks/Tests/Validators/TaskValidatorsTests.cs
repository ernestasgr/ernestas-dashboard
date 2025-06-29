using FluentAssertions;
using Tasks.GraphQL.Types;
using Tasks.Validators;
using Xunit;

namespace Tasks.Tests.Validators;

/// <summary>
/// Unit tests for task input validators.
/// </summary>
public class TaskValidatorsTests
{
    #region CreateTaskInputValidator Tests

    [Fact]
    public void CreateTaskInputValidator_WithValidInput_PassesValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid task text",
            Category: "Work",
            WidgetId: "widget1",
            Priority: 5,
            DueDate: DateTime.UtcNow.AddDays(1),
            Description: "Valid description",
            ParentTaskId: 1,
            DisplayOrder: 1
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData("", "Task text is required")]
    [InlineData(null, "Task text is required")]
    public void CreateTaskInputValidator_WithInvalidText_FailsValidation(string? text, string expectedError)
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: text!,
            Category: "Work"
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void CreateTaskInputValidator_WithTooLongText_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var longText = new string('A', 501); // Exceeds 500 character limit
        var input = new CreateTaskInput(
            Text: longText,
            Category: "Work"
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Task text cannot exceed 500 characters");
    }

    [Theory]
    [InlineData("", "Category is required")]
    [InlineData(null, "Category is required")]
    public void CreateTaskInputValidator_WithInvalidCategory_FailsValidation(string? category, string expectedError)
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: category!
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void CreateTaskInputValidator_WithTooLongCategory_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var longCategory = new string('A', 101); // Exceeds 100 character limit
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: longCategory
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Category cannot exceed 100 characters");
    }

    [Theory]
    [InlineData(-1, "Priority must be between 0 and 10")]
    [InlineData(11, "Priority must be between 0 and 10")]
    public void CreateTaskInputValidator_WithInvalidPriority_FailsValidation(int priority, string expectedError)
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            Priority: priority
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void CreateTaskInputValidator_WithTooLongDescription_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var longDescription = new string('A', 1001); // Exceeds 1000 character limit
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            Description: longDescription
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Description cannot exceed 1000 characters");
    }

    [Fact]
    public void CreateTaskInputValidator_WithPastDueDate_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            DueDate: DateTime.UtcNow.AddDays(-1) // Past date
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Due date cannot be in the past");
    }

    [Fact]
    public void CreateTaskInputValidator_WithInvalidParentTaskId_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            ParentTaskId: 0 // Invalid ID
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Parent task ID must be greater than 0");
    }

    [Fact]
    public void CreateTaskInputValidator_WithNegativeDisplayOrder_FailsValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            DisplayOrder: -1 // Negative value
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Display order must be non-negative");
    }

    #endregion

    #region UpdateTaskInputValidator Tests

    [Fact]
    public void UpdateTaskInputValidator_WithValidInput_PassesValidation()
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(
            Id: 1,
            Text: "Updated text",
            Completed: true,
            Category: "Updated category",
            Priority: 5,
            DueDate: DateTime.UtcNow.AddDays(1),
            Description: "Updated description",
            ParentTaskId: 2,
            DisplayOrder: 1
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void UpdateTaskInputValidator_WithPartialInput_PassesValidation()
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(
            Id: 1,
            Text: "Updated text" // Only updating text
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData(0, "Task ID must be greater than 0")]
    [InlineData(-1, "Task ID must be greater than 0")]
    public void UpdateTaskInputValidator_WithInvalidId_FailsValidation(int id, string expectedError)
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(Id: id);

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void UpdateTaskInputValidator_WithEmptyText_FailsValidation()
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(
            Id: 1,
            Text: "" // Empty text when provided
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Task text cannot be empty");
    }

    [Fact]
    public void UpdateTaskInputValidator_WithEmptyCategory_FailsValidation()
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(
            Id: 1,
            Category: "" // Empty category when provided
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Category cannot be empty");
    }

    #endregion

    #region ReorderTaskInputValidator Tests

    [Fact]
    public void ReorderTaskInputValidator_WithValidInput_PassesValidation()
    {
        // Arrange
        var validator = new ReorderTaskInputValidator();
        var input = new ReorderTaskInput(
            TaskId: 1,
            NewDisplayOrder: 5,
            NewParentTaskId: 2
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void ReorderTaskInputValidator_WithoutParentTaskId_PassesValidation()
    {
        // Arrange
        var validator = new ReorderTaskInputValidator();
        var input = new ReorderTaskInput(
            TaskId: 1,
            NewDisplayOrder: 5
            // No NewParentTaskId - should be valid
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData(0, "Task ID must be greater than 0")]
    [InlineData(-1, "Task ID must be greater than 0")]
    public void ReorderTaskInputValidator_WithInvalidTaskId_FailsValidation(int taskId, string expectedError)
    {
        // Arrange
        var validator = new ReorderTaskInputValidator();
        var input = new ReorderTaskInput(
            TaskId: taskId,
            NewDisplayOrder: 1
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void ReorderTaskInputValidator_WithNegativeDisplayOrder_FailsValidation()
    {
        // Arrange
        var validator = new ReorderTaskInputValidator();
        var input = new ReorderTaskInput(
            TaskId: 1,
            NewDisplayOrder: -1 // Negative value
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Display order must be non-negative");
    }

    [Theory]
    [InlineData(0, "Parent task ID must be greater than 0")]
    [InlineData(-1, "Parent task ID must be greater than 0")]
    public void ReorderTaskInputValidator_WithInvalidParentTaskId_FailsValidation(int parentTaskId, string expectedError)
    {
        // Arrange
        var validator = new ReorderTaskInputValidator();
        var input = new ReorderTaskInput(
            TaskId: 1,
            NewDisplayOrder: 1,
            NewParentTaskId: parentTaskId
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == expectedError);
    }

    #endregion

    #region Edge Cases Tests

    [Fact]
    public void CreateTaskInputValidator_WithNullOptionalFields_PassesValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            WidgetId: null,
            DueDate: null,
            Description: null,
            ParentTaskId: null
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void UpdateTaskInputValidator_WithAllNullOptionalFields_PassesValidation()
    {
        // Arrange
        var validator = new UpdateTaskInputValidator();
        var input = new UpdateTaskInput(Id: 1); // All other fields null

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateTaskInputValidator_WithExactLengthLimits_PassesValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var input = new CreateTaskInput(
            Text: new string('A', 500), // Exactly 500 characters
            Category: new string('B', 100), // Exactly 100 characters
            Description: new string('C', 1000) // Exactly 1000 characters
        );

        // Act
        var result = validator.Validate(input);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateTaskInputValidator_WithBoundaryPriority_PassesValidation()
    {
        // Arrange
        var validator = new CreateTaskInputValidator();
        var inputMin = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            Priority: 0 // Minimum valid priority
        );
        var inputMax = new CreateTaskInput(
            Text: "Valid text",
            Category: "Work",
            Priority: 10 // Maximum valid priority
        );

        // Act
        var resultMin = validator.Validate(inputMin);
        var resultMax = validator.Validate(inputMax);

        // Assert
        resultMin.IsValid.Should().BeTrue();
        resultMax.IsValid.Should().BeTrue();
    }

    #endregion
}
