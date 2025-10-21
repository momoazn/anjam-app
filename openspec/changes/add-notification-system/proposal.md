## Why

The current notification system only shows toasts when users are actively viewing the application. Users miss important updates when the browser tab is not visible or when they're working in other applications. This creates a poor user experience where critical task updates, project changes, and system notifications go unnoticed.

## What Changes

- **ADDED**: Browser tab visibility detection to show notifications only when tab is active
- **ADDED**: Notification queue system to store notifications when tab is hidden
- **ADDED**: Visual indicators (badge counts, page title updates) when notifications are pending
- **ADDED**: Notification history and management interface
- **MODIFIED**: Existing toast system to integrate with visibility detection
- **ADDED**: Real-time notification delivery via WebSocket or polling

## Impact

- Affected specs: notifications (new capability)
- Affected code:
  - `src/app.tsx` - Toaster component integration
  - `src/hooks/` - New notification hooks
  - `src/components/ui/` - Notification components
  - `src/lib/` - Notification utilities and state management
  - `src/store/` - Notification state store
