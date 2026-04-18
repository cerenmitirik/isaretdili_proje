using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsaretDiliAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddModelLabelToLesson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModelLabel",
                table: "Lessons",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModelLabel",
                table: "Lessons");
        }
    }
}
