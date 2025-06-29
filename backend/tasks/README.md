# Tasks Service

This service provides robust task management for the Ernestas Dashboard platform. Built with ASP.NET Core, Entity Framework Core, and HotChocolate GraphQL Federation, it supports advanced task CRUD, hierarchical subtasks, validation, and secure API access.

## Features

-   **GraphQL API**: Query, create, update, delete, and reorder tasks via a federated GraphQL schema.
-   **Task Hierarchy**: Supports parent/child tasks for nested to-do lists and drag-and-drop reordering.
-   **Validation**: All inputs are validated using FluentValidation for data integrity and security.
-   **Secure Gateway**: Requires a gateway secret header for all non-health requests.
-   **Health Checks**: `/health` endpoint for monitoring and readiness probes.
-   **EF Core**: Uses PostgreSQL with migrations and code-first schema management.
-   **Serilog Logging**: Structured logging for observability and debugging.

## Project Structure

-   `Program.cs` — Main entry, DI setup, middleware, endpoint mapping
-   `Data/` — EF Core context and database initializer
-   `Models/` — Task entity definition
-   `GraphQL/` — Queries, mutations, and types for GraphQL API
-   `Services/` — Business logic for task operations
-   `Validators/` — FluentValidation validators for all input types

## Key Endpoints

-   **GraphQL**: `/graphql` — Main API for all task operations
-   **Health**: `/health` — Returns 200 OK if service is running

## Security

-   All non-health requests require a valid `x-gateway-secret` header
-   Introspection queries are allowed without the secret for development
-   Input validation prevents injection and enforces business rules
