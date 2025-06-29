# Notes Service TODO

- [ ] **Content Sanitization**: Implement content sanitization for note content before storage
- [ ] **Structured Error Responses**: Standardize GraphQL error responses with proper error codes
- [ ] **Database Indexes**: Add appropriate indexes for common query patterns (widget_id, labels, created_at)
- [ ] **Pagination**: Implement pagination for large note collections
- [ ] **Caching**: Add Redis caching for frequently accessed notes
- [ ] **Bidirectional Sync**: Implement real-time bidirectional sync with Obsidian
- [ ] **Conflict Resolution**: Add conflict resolution for concurrent edits
- [ ] **Bulk Operations**: Optimize bulk sync operations for large vaults
- [ ] **File Watching**: Implement file watching for automatic sync triggers
- [ ] **Note Templates**: Add support for note templates
- [ ] **Note Linking**: Implement note-to-note linking and backlinks
- [ ] **Full-Text Search**: Add full-text search capabilities using PostgreSQL FTS or Elasticsearch
- [ ] **Note Versions**: Implement note versioning and history
- [ ] **Note Attachments**: Add support for file attachments and images
- [ ] **Note Sharing**: Implement note sharing with permissions
- [ ] **Image Processing**: Add image optimization and thumbnail generation
- [ ] **Export Formats**: Support export to various formats (PDF, HTML, etc.)
- [ ] **Import Formats**: Support import from various sources (Notion, Evernote, etc.)
- [ ] **Smart Suggestions**: Add AI-powered content suggestions
- [ ] **Auto-Save**: Implement auto-save functionality with conflict resolution
- [ ] **Offline Support**: Add offline support with sync when online
- [ ] **Docker Optimization**: Optimize Docker image size and startup time
- [ ] **Note Encryption**: Add client-side note encryption
- [ ] **Backup & Restore**: Implement automated backup and restore functionality

## Completed
- [x] Basic note CRUD operations
- [x] GraphQL API with federation support
- [x] Obsidian integration with sync capabilities
- [x] Label/tag support for notes
- [x] Layout properties for widget positioning
- [x] Async database operations with SQLAlchemy
- [x] Structured logging with Logstash integration
- [x] Basic error handling and exceptions
- [x] Health check endpoints
- [x] Docker containerization
- [x] Sentry integration for error tracking
