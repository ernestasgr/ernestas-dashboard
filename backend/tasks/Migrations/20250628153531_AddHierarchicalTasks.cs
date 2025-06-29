using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tasks.Migrations
{
    /// <inheritdoc />
    public partial class AddHierarchicalTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "parent_task_id",
                table: "tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "idx_tasks_parent_id",
                table: "tasks",
                column: "parent_task_id");

            migrationBuilder.CreateIndex(
                name: "idx_tasks_parent_order",
                table: "tasks",
                columns: new[] { "parent_task_id", "display_order" });

            migrationBuilder.CreateIndex(
                name: "idx_tasks_widget_hierarchy",
                table: "tasks",
                columns: new[] { "widget_id", "parent_task_id", "display_order" });

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks",
                column: "parent_task_id",
                principalTable: "tasks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_tasks_parent_task_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "idx_tasks_parent_id",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "idx_tasks_parent_order",
                table: "tasks");

            migrationBuilder.DropIndex(
                name: "idx_tasks_widget_hierarchy",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "parent_task_id",
                table: "tasks");
        }
    }
}
