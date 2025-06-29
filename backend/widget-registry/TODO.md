# Widget Registry Service TODO

- [ ] **Database Indexes**: Add appropriate indexes for userId, type, and common query patterns
- [ ] **Caching Strategy**: Implement Redis caching for frequently accessed widget configurations
- [ ] **Widget Sharing**: Add ability to share widget configurations between users
- [ ] **Widget Categories**: Add categorization system for better widget organization
- [ ] **Layout Templates**: Add predefined dashboard layout templates
- [ ] **Widget Grouping**: Add ability to group widgets and move them together
- [ ] **Layout History**: Implement layout change history and undo/redo functionality
- [ ] **Widget APIs**: Add external API integration for widgets (weather, news, etc.)

## Completed

- [x] Basic widget CRUD operations
- [x] GraphQL API with Apollo Federation support
- [x] Prisma ORM with PostgreSQL integration
- [x] Widget layout management (position, size)
- [x] Widget configuration support (JSON config)
- [x] Widget type system (clock, weather, notes, tasks)
- [x] Structured logging with Winston and Logstash
- [x] Gateway authentication guard
- [x] Health check endpoints
- [x] Sentry error tracking integration
- [x] Docker containerization
- [x] Basic styling support (colors, themes)
- [x] NestJS framework with TypeScript
