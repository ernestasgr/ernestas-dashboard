# Notes Service

This service provides note management and integration with Obsidian for the Ernestas Dashboard platform. It is built with FastAPI, Strawberry GraphQL, and SQLAlchemy (async), supporting robust note CRUD operations, flexible querying, and optional Obsidian vault sync.

## Features

-   **GraphQL API**: Query, create, update, and delete notes via a federated GraphQL schema.
-   **Obsidian Integration**: Sync notes with an Obsidian vault using the Obsidian Local REST API.
-   **Async SQLAlchemy**: High-performance, async database access with PostgreSQL.
-   **Structured Logging**: Console and Logstash logging with request context and Sentry integration.
-   **Flexible Note Model**: Notes support labels, layout (x, y, width, height), and source tracking (local/obsidian).

## Project Structure

-   `main.py` — FastAPI app, GraphQL router, Sentry, and health endpoints
-   `database.py` — Async SQLAlchemy engine/session setup
-   `models.py` — SQLAlchemy and Pydantic models for notes
-   `repository.py` — Data access layer for notes
-   `service.py` — Business logic for note operations and Obsidian sync
-   `obsidian_service.py` — Handles Obsidian REST API integration
-   `logger.py` — Structured logging (console, Logstash, Sentry)
-   `schema.py` — Strawberry GraphQL types and input definitions
-   `resolvers.py` — GraphQL query and mutation resolvers

## Key Endpoints

-   **GraphQL**: `/graphql` — Main API for all note operations
-   **Health**: `/health` — Returns `{ "status": "healthy" }` if service is running
-   **Sentry Debug**: `/sentry-debug` — Triggers a test exception for Sentry

## Configuration

-   **Database**: Set `DATABASE_URL` (default: `postgresql+asyncpg://postgres:password@notes-db:5432/personal_dashboard_notes`)
-   **Obsidian**: Provide `api_url` and `auth_key` for vault sync features
-   **Logging**: Configure `NODE_ENV`, `ENABLE_LOGSTASH`, `LOGSTASH_HOST`, `LOGSTASH_PORT` for Logstash; `SENTRY_DSN_NOTES` for Sentry

## Security & Best Practices

-   All user input is validated at the GraphQL schema level
-   Environment variables are used for secrets and configuration
-   Logging avoids leaking sensitive data
