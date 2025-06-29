# Tasks Service TODO

-   [ ] **Authorization Middleware**: Implement proper authorization middleware instead of basic user ID checks
-   [ ] **CORS Security**: Review and tighten CORS policy for production environment
-   [ ] **Pagination Implementation**: Implement cursor-based pagination for large task lists
-   [ ] **Caching Strategy**: Add Redis caching for frequently accessed tasks and categories
-   [ ] **Task Templates**: Add support for task templates to speed up task creation
-   [ ] **Recurring Tasks**: Implement recurring task functionality with cron-like scheduling
-   [ ] **Task Dependencies**: Add task dependency management (blocked by, depends on)
-   [ ] **Task Time Tracking**: Implement time tracking for tasks with start/stop functionality
-   [ ] **Task Comments**: Add commenting system for tasks
-   [ ] **Task Attachments**: Support file attachments for tasks
-   [ ] **Task Import/Export**: Support CSV/JSON import and export of tasks
-   [ ] **Advanced Filtering**: Enhance filtering with saved filters and complex query support
-   [ ] **Task Search**: Implement full-text search across task content
-   [ ] **Task Sorting**: Add advanced sorting options (custom sorting, multiple criteria)
-   [ ] **Task Grouping**: Add dynamic task grouping (by status, priority, due date, etc.)
-   [ ] **Notification System**: Implement task due date and reminder notifications
-   [ ] **Task Sharing**: Add task sharing capabilities between users
-   [ ] **Collaborative Tasks**: Enable multiple users to collaborate on tasks
-   [ ] **Task History**: Implement task change history and audit trail
-   [ ] **Smart Suggestions**: Add AI-powered task suggestions and auto-categorization
-   [ ] **Calendar Integration**: Sync tasks with calendar applications
-   [ ] **Dashboard Widgets**: Create dashboard widgets for task summaries
-   [ ] **Export Formats**: Support multiple export formats (PDF, Excel, etc.)
-   [ ] **Docker Optimization**: Optimize Docker image size and startup performance

## Completed

-   [x] Basic task CRUD operations with hierarchical structure
-   [x] GraphQL API with Apollo Federation support
-   [x] Entity Framework Core with PostgreSQL
-   [x] Input validation using FluentValidation
-   [x] Task reordering and hierarchy management
-   [x] Basic filtering and querying capabilities
-   [x] Serilog structured logging
-   [x] Health check endpoints
-   [x] Gateway secret validation middleware
-   [x] Docker containerization
-   [x] Task categories and priority management
-   [x] Due date support
-   [x] Basic GraphQL federation with User entity
