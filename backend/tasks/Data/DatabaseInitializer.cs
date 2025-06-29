using Microsoft.EntityFrameworkCore;

namespace Tasks.Data;

/// <summary>
/// Provides database initialization functionality.
/// </summary>
public static class DatabaseInitializer
{
    /// <summary>
    /// Applies pending migrations to the database.
    /// </summary>
    /// <param name="app">The web application.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TasksDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Checking for pending database migrations...");

            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            if (pendingMigrations.Any())
            {
                logger.LogInformation("Found {MigrationCount} pending migrations. Applying migrations...",
                    pendingMigrations.Count());

                foreach (var migration in pendingMigrations)
                {
                    logger.LogInformation("Pending migration: {MigrationName}", migration);
                }

                await context.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied successfully.");
            }
            else
            {
                logger.LogInformation("No pending migrations found. Database is up to date.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while applying database migrations.");
            throw; // Re-throw to prevent startup if migrations fail
        }
    }
}
