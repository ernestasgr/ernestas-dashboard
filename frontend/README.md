# Ernestas Dashboard Frontend

This is the frontend for the Ernestas Dashboard platform, built with Next.js, React, and TypeScript. It provides a modern, responsive user interface for interacting with dashboard widgets, authentication, and user data.

## Features

- **Next.js**: Server-side rendering, static site generation, and API routes.
- **TypeScript**: Strict typing for maintainable, robust code.
- **Component-based**: Modular, reusable React components.
- **GraphQL Integration**: Communicates with backend services via GraphQL APIs.
- **Authentication**: OAuth2 login and secure session management.
- **Widget System**: Dynamic, user-configurable dashboard widgets.
- **Tailwind CSS**: Utility-first styling for rapid UI development.
- **Sentry Integration**: Error tracking and monitoring.
- **Testing**: Vitest and Testing Library for unit and integration tests.

## Project Structure

### `src/` — Main application source code

- `app/` — Next.js app directory for routing, layouts, and top-level pages
    - `layout.tsx`: Root layout for all pages
    - `global-error.tsx`: Global error boundary
    - `globals.css`: Global styles (Tailwind, custom CSS)
    - `loading.tsx`: Top-level loading indicator
    - `dashboard/`, `login/`: Route segments for dashboard and login pages
    - `page.tsx`: Main page component for the root route
- `components/` — All React UI components, organized by domain
    - `auth/`: Authentication UI (e.g., `LoginForm.tsx`)
    - `dashboard/`: Dashboard UI, including:
        - `CoordinateGrid.tsx`, `DashboardHeader.tsx`, `WidgetForm.tsx`, etc.
        - `widgets/`: Widget-specific components (e.g., `ClockWidget.tsx`, `NotesWidget.tsx`, `TaskWidget.tsx`, `WidgetRenderer.tsx`, etc.)
        - `hooks/`: Dashboard-specific hooks
    - `ui/`: Reusable, generic UI primitives (e.g., `button.tsx`, `card.tsx`, `input.tsx`, `tabs.tsx`, `markdown-renderer.tsx`, etc.)
- `generated/` — Auto-generated files, such as GraphQL TypeScript types (`graphql.tsx`)
- `hooks/` — Custom React hooks for business logic (e.g., `useTasks.ts`)
- `lib/` — Shared utilities, constants, and logic
    - `constants/`: Static values (e.g., OAuth providers, URLs)
    - `events/`: Event bus and event types (e.g., `auth.ts`)
    - `graphql/`: GraphQL queries, mutations, and Apollo client setup
    - `listeners/`: React components for listening to global events (e.g., `AuthRedirectListener.tsx`)
    - `schemas/`: TypeScript types and validation schemas (e.g., `user.ts`)
    - `stores/`: State management utilities (e.g., `use-event-store.ts`)
    - `utils/`: Utility functions (e.g., `auth-utils.ts`, `env-utils.ts`, `tailwind-utils.ts`), plus:
        - `widget-styling/`: Widget theming, color, and style utilities
    - `validation/`: Validation logic for widgets and forms
- `instrumentation-client.ts` / `instrumentation.ts`: Sentry or other monitoring instrumentation setup

### Other top-level files

- `public/` — Static assets
- `components.json` — Widget/component registry
- `codegen.yml` — GraphQL code generation config
- `tsconfig.json` — TypeScript configuration
- `postcss.config.mjs` — PostCSS/Tailwind config
- `vitest.config.ts` — Vitest test runner config
