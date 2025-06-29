# Auth Service

This service provides authentication and token management for the Ernestas Dashboard platform. It is built with Spring Boot and supports OAuth2 login, JWT-based authentication, refresh token rotation, and secure cookie handling. The service is designed for modularity, security, and robust error handling.

## Features

-   **OAuth2 Login**: Integrates with external OAuth2 providers for user authentication.
-   **JWT Access & Refresh Tokens**: Issues signed JWTs for stateless authentication and supports refresh token rotation.
-   **Refresh Token Storage**: Stores refresh tokens in a database, enabling token revocation and cleanup.
-   **Scheduled Maintenance**: Periodically cleans up expired refresh tokens.
-   **GraphQL API**: Exposes authentication operations via GraphQL endpoints.
-   **Secure Cookie Handling**: Issues HTTP-only, secure cookies for tokens.
-   **Custom Exception Handling**: Maps authentication errors to GraphQL error responses.
-   **Health Endpoints**: Provides `/health` and `/debug-sentry` endpoints for monitoring and debugging.

## Project Structure

-   `config/` — Spring configuration (security, scheduling, GraphQL federation)
-   `controller/` — REST and GraphQL controllers (authentication, health checks)
-   `model/` — JPA entities (User, RefreshToken)
-   `repository/` — Spring Data repositories for persistence
-   `service/` — Business logic for users and tokens
-   `security/` — OAuth2 and JWT integration, custom handlers
-   `util/` — Utility classes (cookie generation, JWT utilities)
-   `graphql/` — GraphQL federation config, interceptors, and exception resolvers

## Key Endpoints

-   **GraphQL**: `/graphql` — Main API for authentication operations
-   **Health**: `/health` — Returns `OK` if the service is running
-   **Debug Sentry**: `/debug-sentry` — Triggers a test exception for Sentry integration

## Security Practices

-   All user input is validated and sanitized.
-   JWT secrets and sensitive configs are loaded from environment variables.
-   Secure, HTTP-only cookies are used for token storage.
-   Scheduled cleanup prevents token bloat and reduces attack surface.
-   Custom exception resolver prevents leaking internal details.
