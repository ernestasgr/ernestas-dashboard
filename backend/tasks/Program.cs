using System.Text;
using FluentValidation;
using HotChocolate.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog;
using Tasks.Data;
using Tasks.GraphQL.Mutations;
using Tasks.GraphQL.Queries;
using Tasks.GraphQL.Types;
using Tasks.Services;
using Tasks.Validators;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddDbContext<TasksDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITaskService, TaskService>();

builder.Services.AddScoped<IValidator<CreateTaskInput>, CreateTaskInputValidator>();
builder.Services.AddScoped<IValidator<UpdateTaskInput>, UpdateTaskInputValidator>();
builder.Services.AddScoped<IValidator<ReorderTaskInput>, ReorderTaskInputValidator>();

builder.Services
    .AddGraphQLServer()
    .AddQueryType<TaskQueries>()
    .AddMutationType<TaskMutations>()
    .AddType<TaskType>()
    .AddType<UserType>()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .AddApolloFederation()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true);

builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors();

app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

    logger.LogInformation("Received request: {Method} {Path}", context.Request.Method, context.Request.Path);

    if (context.Request.Path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase))
    {
        logger.LogInformation("Health check endpoint accessed, skipping gateway secret validation.");
        await next();
        return;
    }

    if (context.Request.Path.StartsWithSegments("/graphql", StringComparison.OrdinalIgnoreCase) &&
        context.Request.Method == "POST")
    {
        logger.LogInformation("GraphQL endpoint accessed, checking for introspection query.");
        context.Request.EnableBuffering();
        using var bodyStream = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await bodyStream.ReadToEndAsync();
        logger.LogInformation("Request body: {Body}", body);
        context.Request.Body.Position = 0;

        if (body.Contains("__schema") || body.Contains("IntrospectionQuery"))
        {
            logger.LogInformation("Introspection query detected, skipping gateway secret validation.");
            await next();
            return;
        }
    }

    var gatewaySecret = context.Request.Headers["x-gateway-secret"].FirstOrDefault();
    var expectedSecret = builder.Configuration["GATEWAY_SECRET"];

    logger.LogInformation("Validating gateway secret header.");

    if (string.IsNullOrEmpty(gatewaySecret) || gatewaySecret != expectedSecret)
    {
        logger.LogWarning("Unauthorized request: Invalid or missing gateway secret.");
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Unauthorized: Invalid gateway secret");
        return;
    }
    logger.LogInformation("Gateway secret found and valid: {GatewaySecret}", gatewaySecret);
    logger.LogInformation("Gateway secret validated successfully.");
    await next();
});

app.MapGraphQL("/graphql");
app.MapHealthChecks("/health");

await app.InitializeDatabaseAsync();

app.Run();
