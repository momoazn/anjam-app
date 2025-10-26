<!-- a5cdd6d9-be99-45fb-a7eb-449e0dc9fdf1 2bbc8551-06ce-44c0-8d33-fccd2455908a -->
# Simplify Notification System

## Overview

Streamline the notification system to be minimal and basic while keeping all essential functionality: real-time updates, automatic creation, audio cues, header component, and notifications page.

## Changes Required

### 1. Backend (Go) - Simplify Notification Schema

**File**: `pb_schema.json`

- Remove `priority` field from notifications collection
- Keep: `user`, `type`, `title`, `message`, `read`, `data`, `created`, `updated`

**File**: `main.go`

- Update all notification creation calls to remove priority parameter
- Simplify `createNotification` function signature
- Keep all existing notification triggers (task assignment, task updates, project updates, comments, user-project joins)

### 2. Frontend Store - Simplify State Management

**File**: `src/store/notification-store.ts`

- Remove: `queuedNotifications`, `isTabVisible`, `soundVolume`, `processQueuedNotifications`, `removeOldNotifications`, `setTabVisibility`, `setSoundVolume`, `markAllAsUnread`
- Keep: `notifications`, `unreadCount`, `soundEnabled`, `isLoading`, `error`, `subscriptionId`
- Simplify actions: `loadNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `clearAll`, `clearRead`, `subscribeToRealtime`, `unsubscribeFromRealtime`, `setSoundEnabled`
- Remove Zustand persistence (no need to persist notifications locally)
- Always play sound when `soundEnabled` is true, regardless of tab visibility

### 3. Notification Service - Keep Simple

**File**: `src/lib/notification-service.ts`

- Remove: `markAllAsUnread`, `createNotification` (notifications are only created server-side)
- Keep all other methods for fetching, updating, deleting, and subscribing

### 4. Notification Sounds - Simplify

**File**: `src/lib/notification-sounds.ts`

- Remove: `setVolume`, `volume` property, different sound types
- Keep: Single notification sound, `setEnabled`, `playSound` (no type parameter)
- Always play at fixed volume (0.3)

### 5. Remove Unnecessary Files

- Delete: `src/lib/notification-settings-service.ts` (if exists)
- Delete: `src/hooks/use-notification-sounds.ts` (if exists)

### 6. Simplify Components

**File**: `src/components/notification-dropdown.tsx`

- Remove priority display and filtering
- Simplify UI to show: title, message, time, read/unread indicator
- Keep: mark as read, clear all, view all link
- Show last 10 notifications

**File**: `src/components/notification-badge.tsx`

- No changes needed (already simple)

**File**: `src/pages/notifications.tsx`

- Remove: priority filters, mark all as unread, bulk selection, sorting by priority
- Keep: filter by all/unread/read, mark as read/unread, delete, clear all/read
- Simplify grouping (by date only: today, yesterday, this week, older)
- Remove keyboard shortcuts

**File**: `src/components/notification-settings.tsx`

- Simplify to only show: sound enable/disable toggle
- Remove: notification type preferences, priority settings, volume control
- Remove save/reset buttons (changes apply immediately)

### 7. Simplify Hooks

**File**: `src/hooks/use-tab-visibility.ts`

- Remove notification-related logic
- Keep basic tab visibility detection (may be used elsewhere)

**File**: `src/hooks/use-load-notifications.ts`

- Simplify to only load notifications and subscribe to real-time
- Remove duplicate subscription logic (already in store)

**File**: `src/hooks/use-realtime-notifications.ts`

- Keep as-is (already simple)

### 8. Update Type Definitions

**File**: `src/lib/pocketbase-types.ts`

- Update `NotificationsRecord` interface to remove `priority` field

### 9. App Integration - Simplify

**File**: `src/app.tsx`

- Remove `useTabVisibility` hook usage for notifications
- Keep: `useRealtimeNotifications`, `useLoadNotifications`, sound manager initialization

### 10. Text Constants

**File**: `src/constants/text.ts`

- Remove priority-related text
- Keep type-related text
- Simplify notification action text

## Key Principles

1. **Server-side only creation**: All notifications created automatically by backend on relevant actions
2. **No manual creation**: Remove any UI for manually creating notifications
3. **Always real-time**: No queueing based on tab visibility
4. **Simple audio**: Single sound, always plays when enabled, no volume control
5. **Type-based only**: Keep notification types for context, remove priorities
6. **Minimal UI**: Clean, simple interface focused on reading and managing notifications

### To-dos

- [ ] Update pb_schema.json to remove priority field from notifications collection
- [ ] Simplify main.go notification handlers to remove priority parameter
- [ ] Update pocketbase-types.ts to remove priority field from NotificationsRecord
- [ ] Simplify notification-store.ts by removing queue, tab visibility, volume, and unused actions
- [ ] Remove manual creation and markAllAsUnread from notification-service.ts
- [ ] Simplify notification-sounds.ts to single sound with fixed volume
- [ ] Delete notification-settings-service.ts and use-notification-sounds.ts if they exist
- [ ] Simplify notification-dropdown.tsx to remove priority display
- [ ] Simplify notifications.tsx page to remove priority filters, bulk actions, and keyboard shortcuts
- [ ] Simplify notification-settings.tsx to only show sound toggle
- [ ] Simplify use-tab-visibility.ts and use-load-notifications.ts
- [ ] Remove tab visibility hook usage from app.tsx
- [ ] Update text.ts to remove priority-related text