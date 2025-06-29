# Ernestas Dashboard

Ernestas Dashboard is a modular, full-stack platform for building customizable, secure, and extensible personal dashboards. It integrates multiple microservices for authentication, widgets, notes, and tasks, all orchestrated through a federated GraphQL gateway and a modern Next.js frontend.

## Purpose

The project aims to provide a robust, extensible dashboard for personal productivity, supporting:

-   Secure authentication (OAuth2, JWT)
-   Customizable widgets (clock, weather, notes, tasks, etc.)
-   Note-taking with Obsidian integration
-   Task management with advanced hierarchy and filtering
-   Real-time, federated GraphQL API
-   Observability and monitoring (Sentry, ELK stack)

## Services & Their Purpose

-   **frontend/**: Next.js/React UI for the dashboard. Handles user interaction, widget layout, authentication, and data visualization.
-   **gateway/**: Apollo Gateway (Node.js/TypeScript) federates all backend GraphQL APIs, handles authentication, CSRF, logging, and security.
-   **backend/auth/**: Spring Boot service for authentication (OAuth2, JWT), user management, and refresh token rotation.
-   **backend/widget-registry/**: NestJS/Prisma service for widget CRUD, layout, and configuration. Supports multiple widget types.
-   **backend/notes/**: FastAPI/Strawberry service for note CRUD, with optional Obsidian vault sync.
-   **backend/tasks/**: ASP.NET Core/HotChocolate service for advanced task management, hierarchy, and filtering.
-   **ELK stack**: (Optional) Elasticsearch, Logstash, Kibana for centralized logging and monitoring.

## Technologies Used

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Apollo Client, Vitest, Testing Library
-   **Gateway**: Node.js, Apollo Gateway, Express, TypeScript, Sentry, Zod
-   **Auth**: Spring Boot, Java, Spring Security, OAuth2, JWT, PostgreSQL
-   **Widget Registry**: NestJS, TypeScript, Apollo Federation, Prisma, PostgreSQL
-   **Notes**: FastAPI, Python, Strawberry GraphQL, SQLAlchemy (async), PostgreSQL
-   **Tasks**: ASP.NET Core, C#, HotChocolate GraphQL, EF Core, PostgreSQL
-   **Observability**: Sentry, ELK (Elasticsearch, Logstash, Kibana)

## Features

-   Modular, microservice-based architecture
-   Federated GraphQL API for all data
-   Secure authentication and session management
-   Customizable, user-specific widgets
-   Notes with Obsidian vault sync
-   Hierarchical, filterable tasks
-   Centralized logging and error monitoring
-   Health and debug endpoints for all services

## How to Run

### Prerequisites

-   Docker & Docker Compose

### Start All Services

**Without ELK stack logging:**

```sh
docker compose up --build --watch
```

**With ELK stack logging:**

```sh
docker compose --profile elk -f docker-compose.yml -f docker-compose.elk.yml up --build --watch
```

### Running Tests

-   Frontend: `cd frontend && pnpm test`
-   E2E: `cd frontend && pnpm test:e2e`
-   Gateway: `cd gateway && pnpm test`
-   Auth: `cd backend/auth && ./mvnw test`
-   Notes: `cd backend/notes && python -m pytest tests/ -v`
-   Widget Registry: `cd backend/widget-registry && pnpm test`
-   Tasks: `cd backend/tasks && dotnet test`

---

For more details, see the README in each service directory.
