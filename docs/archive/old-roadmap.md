# Development Roadmap

This document outlines the strategic planning and future direction for the Anjam application.

## Current Status

The application has a solid foundation with core task and project management features. See [Implementation Status](./IMPLEMENTATION_STATUS.md) for detailed current state.

## Short-Term Priorities (Next 1-3 Months)

### Bug Fixes & Stability

- ✅ Fix `getTaskStatus` undefined return bug
- ✅ Align documentation with actual scripts
- Improve error handling and validation
- Enhance test coverage for critical paths

### UX Improvements

- Global search across tasks, projects, and comments
- Improved mobile responsiveness
- Better loading states and error messages
- Enhanced notification UI

### Performance

- Optimize large task list rendering
- Implement pagination for long lists
- Add query result caching strategies
- Reduce initial bundle size

## Medium-Term Goals (3-6 Months)

### Feature Enhancements

#### Subtasks & Hierarchical Tasks

- Add support for subtasks/checklists within tasks
- Implement parent-child task relationships
- Update UI to display task hierarchies
- Consider impact on status calculations

#### Dependencies

- Task dependency tracking ("blocked by", "blocks")
- Visual dependency graphs
- Dependency-aware status transitions
- Warning system for invalid transitions

#### Enhanced Notifications

- Email notifications (Phase 1)
- User notification preferences
- Digest emails for daily/weekly summaries
- Webhook integrations (Phase 2)
- Slack/Teams integration (Phase 3)

#### Advanced Permissions

- Data-driven permission overrides
- Per-project role assignments
- Custom role definitions
- Fine-grained access controls

### Infrastructure

#### Audit Logging

- Comprehensive audit log system
- Field-level change tracking
- IP address and user agent logging
- Admin UI for viewing audit logs
- Export capabilities for compliance

#### Background Jobs

- Job queue system for async tasks
- Email sending queue
- Scheduled tasks (reminders, digests)
- Background report generation

## Long-Term Vision (6-12 Months)

### Enterprise Features

#### Multi-Tenancy

- Organizations/tenants support
- Tenant-scoped data isolation
- Per-tenant customization
- Tenant management UI

#### Advanced Reporting

- Custom report builder
- Scheduled report generation
- Export to various formats (PDF, Excel, etc.)
- Dashboard widgets

#### Epics & Initiatives

- Epic/initiative containers
- Cross-project coordination
- High-level roadmap views
- Strategic planning tools

### Integration & Extensibility

#### API & Webhooks

- Comprehensive REST API documentation
- Webhook system for external integrations
- API rate limiting and authentication
- SDK development (TypeScript, Python)

#### Third-Party Integrations

- GitHub/GitLab integration
- Calendar sync (Google Calendar, Outlook)
- Time tracking tool integration
- Project management tool import/export

### Performance & Scale

#### Scalability Improvements

- Database indexing optimization
- Query optimization
- Caching layer (Redis)
- CDN for static assets

#### High Availability

- Database replication
- Load balancing support
- Health check endpoints
- Graceful degradation strategies

## Technical Debt

### Code Quality

- Refactor legacy components
- Improve type coverage
- Enhance error boundaries
- Standardize component patterns

### Documentation

- API documentation
- Component storybook
- Architecture decision records (ADRs)
- Deployment guides

### Testing

- Increase unit test coverage
- Add integration tests
- Performance testing
- Security testing

## Known Limitations

See [Codebase Issues](./CODEBASE_ISSUES.md) for detailed list of current limitations, including:

- Single-tenant architecture
- Synchronous side effects in HTTP requests
- Static permission model
- Limited auditing beyond logins
- No global search
- No first-class subtasks/dependencies

These limitations inform the roadmap priorities above.

## Contribution Guidelines

When proposing new features or improvements:

1. Open an issue to discuss the approach
2. Consider impact on existing functionality
3. Ensure alignment with project goals
4. Follow [Development Guide](./DEVELOPMENT_GUIDE.md) for implementation
5. Include tests and documentation

## Related Documentation

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current state
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical guidance
- [Codebase Issues](../CODEBASE_ISSUES.md) - Known limitations
- [Project Overview](./PROJECT_OVERVIEW.md) - High-level introduction
