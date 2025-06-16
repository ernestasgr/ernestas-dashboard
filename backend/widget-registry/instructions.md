# 🧩 Widget Registry Service

## Overview

The **Widget Registry Service** is a GraphQL microservice in a federated architecture responsible for **discovering, aggregating, and exposing widget metadata and configuration** to the frontend dashboard.

It acts as an **intermediary gateway** between the main Apollo Federation Gateway and individual widget services (e.g., clock, weather, notes). Each widget service may be implemented independently, using any technology stack, and exposed as a federated GraphQL subgraph.

This service makes it possible to:

- Dynamically register new widgets
- Query available widgets and their metadata
- Load widget configurations per user
- Delegate specific widget queries to the correct subgraph

---

## Responsibilities

- 🔁 **Federate GraphQL schemas** from individual widget services (clock, weather, notes, etc.)
- 📚 **Expose a unified `Widget` type** and aggregate metadata/configuration
- 🧠 **Resolve widget-specific fields** via subgraph delegation
- 🧾 Maintain a **registry of active widgets** (possibly static or via service discovery)
- 🛠 Optionally provide widget-level customization and configuration for users

---

## Example Schema

```graphql
type Widget @key(fields: "id") {
    id: ID!
    type: String!
    title: String
    config: WidgetConfig
}

union WidgetConfig = ClockConfig | WeatherConfig | NotesConfig | TasksConfig

type Query {
    widgets(userId: ID!): [Widget!]!
}
```

Each widget subgraph defines its own `...Config` type (e.g., `ClockConfig`, `WeatherConfig`) and resolves the `Widget.config` field when delegated from the registry.

---

## Architecture

```
                    +------------------+
                    |   Main Gateway   |
                    +--------+---------+
                             |
                     +-------v--------+
                     | Widget Registry |
                     +-------+--------+
                             |
        +---------+----------+-------------+-----------+
        |         |                        |           |
   Clock Service  Weather Service      Notes Service   ...
```

- The registry service is itself a **federated gateway**, not a subgraph
- It exposes a composed schema to the **main GraphQL gateway**
- It **delegates subfields** like `config` to the appropriate widget service

---

## Stack

- Framework: **NestJS**
- GraphQL: **Apollo Gateway (Federation 2)**
- Subgraph Integration: Via static config or service discovery
- Optional DB: PostgreSQL or Redis for persistent widget metadata/configuration

---

## Development Notes

- Each widget service must expose its schema as a **federated GraphQL subgraph**
- The widget registry service should define `@key(fields: "id")` for the `Widget` entity
- Widget config is dynamically resolved through `__resolveReference` or direct subgraph delegation
- Prefer schema-driven composition over tightly coupled widget definitions

---

## Future Features

- Widget permissions / ACL per user or role
- Widget usage analytics
- Dynamic layout rules or constraints
- Widget versioning or rollout flags

---

## Related Frontend Example

Frontend uses `react-grid-layout` and expects to receive a list of widgets with:

- `id`
- `type`
- `config` (widget-specific)

Example widget types: `clock`, `weather`, `notes`, `tasks`.

---

## Example Query

```graphql
query GetUserWidgets($userId: ID!) {
    widgets(userId: $userId) {
        id
        type
        config {
            ... on ClockConfig {
                timezone
            }
            ... on NotesConfig {
                content
            }
        }
    }
}
```

---

## Contributing

- New widgets should be added as **separate subgraphs**
- Registry should remain agnostic to specific widget logic
- Validate schema composition before merge (`rover supergraph compose`)
