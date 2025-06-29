# Widget Registry Service

This service manages user widgets for the Ernestas Dashboard platform. Built with NestJS, Apollo Federation, and Prisma, it provides a secure, extensible GraphQL API for widget CRUD, layout, and configuration management.

## Features

- **GraphQL API**: Query, create, update, delete, and reorder widgets with a federated schema.
- **Widget Types**: Supports multiple widget types (clock, weather, notes, tasks, etc.) with type-safe configs.
- **Prisma ORM**: Uses Prisma for PostgreSQL database access and migrations.
- **Secure Gateway**: All non-public endpoints require a valid `x-gateway-secret` header.
- **Public Endpoints**: Health and debug endpoints are accessible without authentication.
- **Sentry Integration**: Error tracking and monitoring with Sentry.
- **Structured Logging**: Centralized logging for observability and debugging.
- **Extensible**: Easily add new widget types and config schemas.

## Project Structure

- `src/app.module.ts` — Main module, DI setup, GraphQL, Sentry, and guards
- `src/widget/` — Widget module, resolver, service, and types
- `src/prisma/` — Prisma service for DB access
- `src/guards/` — Gateway authentication guard
- `src/decorators/` — `@Public()` decorator for public endpoints
- `src/logger/` — Logger service and module
- `src/app.controller.ts` — Health and debug endpoints

## Key Endpoints

- **GraphQL**: `/graphql` — Main API for all widget operations
- **Health**: `/health` — Returns `{ status: 'ok', service: 'widget-registry' }`
- **Sentry Debug**: `/debug-sentry` — Triggers a test error for Sentry

## Security

- All non-public requests require a valid `x-gateway-secret` header
- Public endpoints are marked with the `@Public()` decorator
- Input validation and type safety enforced via GraphQL schema
