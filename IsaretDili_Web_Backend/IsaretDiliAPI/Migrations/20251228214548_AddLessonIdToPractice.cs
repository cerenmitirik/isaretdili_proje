using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsaretDiliAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonIdToPractice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LessonId",
                table: "PracticeSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LessonId",
                table: "PracticeSessions");
        }
    }
}
