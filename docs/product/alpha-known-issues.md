# Alpha Known Issues

This document lists known limitations and issues in the Anjam Public Alpha.

## Overview

Anjam is in public alpha. We're actively developing and testing. Some features are incomplete or may not work as expected.

## Known Limitations

### Features Not Yet Implemented

- **Watch/Star Tasks**: The ability to watch tasks/projects for notifications is planned but not yet implemented
- **Advanced Keyboard Shortcuts**: Full keyboard navigation and shortcuts are planned for future releases
- **Bulk Operations in Inbox**: Multi-select bulk actions are available in the Tasks view but not yet in Inbox
- **Task Dependencies**: Linking tasks (blocks/blocks by) is not yet implemented

### Known Issues

- **Performance with Large Datasets**: The Insights page may be slow when viewing organizations with 1000+ tasks
- **Date Formatting**: Some date formats may display inconsistently between pages
- **Real-time Updates**: Notification real-time updates may have a slight delay (up to 5 seconds)

### Items Deferred to Beta

- **Advanced Reporting**: Custom date ranges, export options, and detailed analytics
- **Integrations**: Third-party integrations (Slack, GitHub, etc.)
- **Mobile App**: Native mobile applications
- **SSO/SAML**: Enterprise authentication

## Workarounds

### Slow Insights Page

If the Insights page loads slowly:

1. Try refreshing the page
2. The page caches results, so subsequent loads will be faster

### Missing Notifications

If you don't receive expected notifications:

1. Check your notification preferences in Settings → Preferences
2. Ensure you're assigned to tasks
3. Notifications are sent for: assignment, mentions, status changes on your tasks

## Reporting Issues

Found a bug or have feedback?

- Email: alpha@anjam.app
- GitHub: https://github.com/mohammadhmn/anjam/issues

## Changelog

### v0.0.0 (Alpha)

- Initial public alpha release
- Core task management (create, edit, assign, status changes)
- Project management
- Inbox with mentioned tasks filtering
- Insights dashboard with basic metrics
- Notifications system
- Command palette (Cmd+K)
- Persian UI language
