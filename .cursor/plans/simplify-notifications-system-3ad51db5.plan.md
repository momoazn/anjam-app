<!-- 3ad51db5-abfc-42e0-b26a-709e2fcc47f0 9fb07227-c452-4890-9aa6-40108de0aa94 -->

# Simplify Notifications System

## Current Issues

The notification system has **three unnecessary layers**:

- `NotificationService` class (253 lines) - manual subscription tracking
- Zustand `notification-store.ts` (233 lines) - duplicates React Query functionality
- Custom `use-load-notifications.ts` hook - useRef tracking complexity

**Total: ~500 lines of unnecessary code**

## Simplified Architecture

**Replace with ONE file**: `src/hooks/notifications.ts`

This single hook will:

- Use `useQuery` to fetch and cache notifications
- Set up PocketBase realtime subscription in `useEffect`
- Update React Query cache on realtime events (create/update/delete)
- Provide `useMutation` hooks for actions (mark as read, delete, etc.)
- Show toast notifications for new items
- Handle loading/error states automatically

## Implementation Details

### New Hook Structure

```typescript
// src/hooks/notifications.ts

// Main query hook
export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch notifications
  const query = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await pb
        .collection("notifications")
        .getFullList({ filter: `user = "${userId}"`, sort: "-created" });
    },
    enabled: !!userId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = await pb.collection("notifications").subscribe(
      "*",
      (e) => {
        queryClient.setQueryData(["notifications", userId], (old) => {
          // Handle create/update/delete
        });

        // Show toast for new notifications
        if (e.action === "create") {
          toast(e.record.title, { description: e.record.message });
        }
      },
      { filter: `user = "${userId}"` },
    );

    return () => unsubscribe();
  }, [userId]);

  return query;
}

// Computed values
export function useUnreadCount() {
  const { data: notifications = [] } = useNotifications(userId);
  return notifications.filter((n) => !n.read).length;
}

// Mutations
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      pb.collection("notifications").update(id, { read: true }),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries(["notifications"]);
      const previous = queryClient.getQueryData(["notifications", userId]);
      queryClient.setQueryData(["notifications", userId], (old) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },
  });
}

// Similar mutations for: markAllAsRead, deleteNotification, clearAll, clearRead
```

## Changes Required

### 1. Delete Files

- `src/lib/notification-service.ts` (253 lines)
- `src/store/notification-store.ts` (233 lines)
- `src/hooks/use-load-notifications.ts` (51 lines)

**Total removed: ~540 lines**

### 2. Create New File

- `src/hooks/notifications.ts` (~150 lines)
  - `useNotifications()` - main query + subscription
  - `useUnreadCount()` - computed value
  - `useMarkAsRead()` - mutation
  - `useMarkAllAsRead()` - mutation
  - `useDeleteNotification()` - mutation
  - `useClearAll()` - mutation
  - `useClearRead()` - mutation

### 3. Update Components

**src/app.tsx**

```diff
- import { useLoadNotifications } from "@/hooks/use-load-notifications";
+ import { useNotifications } from "@/hooks/notifications";

function AppLayout() {
  const isLoggedIn = useAuthIsLoggedIn();
- useLoadNotifications();
+ const user = useAuthUser();
+ useNotifications(user?.id); // Auto-subscribes
```

**src/components/notification-badge.tsx**

```diff
- import { useUnreadCount } from "@/store/notification-store";
+ import { useUnreadCount } from "@/hooks/notifications";
```

**src/components/notification-dropdown.tsx**

```diff
- import { useNotifications, useMarkAsRead, ... } from "@/store/notification-store";
+ import { useNotifications, useMarkAsRead, ... } from "@/hooks/notifications";
```

**src/pages/notifications.tsx**

```diff
- import { useNotifications, useMarkAsRead, ... } from "@/store/notification-store";
+ import { useNotifications, useMarkAsRead, ... } from "@/hooks/notifications";
```

## Key Benefits

1. **~400 lines removed** (540 deleted - 150 added)
2. **Single source of truth** - React Query cache
3. **Automatic features**:

   - Loading states
   - Error handling
   - Cache invalidation
   - Optimistic updates
   - Automatic refetching

4. **Consistent patterns** - matches tasks/projects/users hooks
5. **Simpler mental model** - standard React Query + PocketBase subscription
6. **No manual state sync** - React Query handles everything
7. **Better TypeScript** - full type inference from PocketBase types

## PocketBase Subscription Pattern

```typescript
// Simple and direct - no wrapper needed
const unsubscribe = await pb.collection('notifications').subscribe(
  '*',                                    // Subscribe to all records
  (e) => {                               // Callback for events
    if (e.action === 'create') { ... }   // New notification
    if (e.action === 'update') { ... }   // Updated notification
    if (e.action === 'delete') { ... }   // Deleted notification
  },
  { filter: `user = "${userId}"` }       // Server-side filtering
);

// Cleanup
return () => unsubscribe();
```

No subscription IDs, no tracking, no complexity - just works!

### To-dos

- [ ] Create new src/hooks/notifications.ts with React Query + PocketBase subscription
- [ ] Update src/app.tsx to use new hook
- [ ] Update src/components/notification-badge.tsx imports
- [ ] Update src/components/notification-dropdown.tsx imports
- [ ] Update src/pages/notifications.tsx imports
- [ ] Delete notification-service.ts, notification-store.ts, use-load-notifications.ts
- [ ] Test notifications loading, real-time updates, and all actions
