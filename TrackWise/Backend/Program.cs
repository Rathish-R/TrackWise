
using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<Backend.Repository.IExpenseRepository, Backend.Repository.ExpenseRepository>();
builder.Services.AddScoped<Backend.Services.IExpenseService, Backend.Services.ExpenseService>();
builder.Services.AddDbContext<AppDbContext>(options =>{
 IConfiguration configuration = builder.Configuration;
  string connString = configuration.GetConnectionString("ConnectionStrings.Default") ?? "Data Source=TrackWise.db";
    options.UseSqlite(connString);
}
 
    );
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
