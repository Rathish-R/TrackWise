using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "$");

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "en");

            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "default");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Theme",
                table: "Users");
        }
    }
}
