# Auth Service TODO

-   [ ] **Rate Limiting**: Implement rate limiting for authentication endpoints to prevent brute force attacks
-   [ ] **Audit Logging**: Implement detailed audit logging for all authentication events
-   [ ] **Multi-Provider Support**: Add support for additional OAuth2 providers (Microsoft, Apple, etc.)
-   [ ] **User Roles & Permissions**: Implement role-based access control (RBAC)
-   [ ] **Integration Tests**: Add more comprehensive integration tests
-   [ ] **Load Testing**: Implement load testing for authentication flows
-   [ ] **Docker Optimization**: Optimize Docker image size and startup time
-   [ ] **Database Migration Strategy**: Implement proper database migration and rollback strategy

## Completed

-   [x] Basic OAuth2 authentication with Google and GitHub
-   [x] JWT token generation and validation
-   [x] Refresh token rotation
-   [x] GraphQL API with federation support
-   [x] Basic user management
-   [x] Cookie-based token storage
-   [x] Scheduled token cleanup
-   [x] Basic error handling and logging
-   [x] Docker containerization
-   [x] Health check endpoint
