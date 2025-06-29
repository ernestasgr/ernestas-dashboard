# Ernestas Dashboard Gateway

This service is the API gateway for the Ernestas Dashboard platform. It federates multiple backend GraphQL services (auth, widget-registry, notes, tasks) into a single endpoint, providing authentication, security, and request orchestration.

## Features

-   **Apollo Gateway**: Federates multiple subgraphs into a unified GraphQL API.
-   **Express Middleware**: Handles cookies, CORS, CSRF protection, and request logging.
-   **JWT Authentication**: Validates access tokens for protected operations.
-   **CSRF Protection**: Issues and validates CSRF tokens for all GraphQL POST requests.
-   **Sentry Integration**: Error tracking and monitoring.
-   **Structured Logging**: Context-aware logging for all requests and subgraph interactions.
-   **Health & Debug Endpoints**: `/health` and `/debug-sentry` for monitoring and error testing.
-   **OAuth2 Proxy**: Handles OAuth2 redirects for authentication flows.

## Project Structure

-   `src/gateway.ts` — Main entry point, gateway setup, middleware, and server logic
-   `src/logger.ts` — Structured logging utilities
-   `src/instrument.ts` — Sentry instrumentation
-   `src/types.ts` — TypeScript type declarations

## Key Endpoints

-   **GraphQL**: `/graphql` — Unified API for all dashboard operations
-   **CSRF Token**: `/csrf-token` — Issues CSRF tokens for clients
-   **OAuth2 Redirect**: `/oauth2` — Proxies OAuth2 redirects to the auth service
-   **Health**: `/health` — Returns 200 OK if service is running
-   **Sentry Debug**: `/debug-sentry` — Triggers a test error for Sentry

## Security

-   All GraphQL POST requests require a valid CSRF token (except introspection, `me`, and `refresh` operations)
-   JWT access tokens are validated for protected operations
-   Gateway secret is injected into all subgraph requests
-   CORS is restricted to the configured frontend domain
