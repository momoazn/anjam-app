# Frontend Architecture

This document outlines the architectural patterns, component structure, and state management used in the frontend of Anjam.

## 1. Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (Auth, Sidebar) + TanStack Query (Server State)
- **UI Library**: Shadcn UI (Radix Primitives + Tailwind CSS)
- **Routing**: React Router DOM

## 2. Organization Context

The application is multi-tenant. The "Current Organization" is the root context for most data views.

### Auth Store (`src/store/auth-store.ts`)

Manages the user's session and their active organization.

- `currentOrganization`: The organization currently being viewed.
- `currentOrgRole`: The user's role in that organization (`owner`, `admin`, `member`).
- `switchOrganization(orgId)`: Updates the context and refreshes data.

### Org Switcher

Located in the sidebar, this component allows users to toggle between their organizations or create a new one.

## 3. Component Patterns

### Common Imports

We use strict path aliases and standard libraries.

```tsx
// UI Components from local shadcn library
import { zodResolver } from "@hookform/resolvers/zod";
// Data Fetching
import { useMutation, useQuery } from "@tanstack/react-query";
// Form Handling
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
```

### Data Fetching (Hooks)

All API interaction is encapsulated in custom hooks located in `src/hooks/`.

- **Pattern**: `use[Resource][Action]` (e.g., `useTasks`, `useCreateTask`).
- **Keys**: Centralized in `src/hooks/query-keys.ts` to ensure consistent cache invalidation.
- **Error Handling**: Centralized error utils (`handlePocketBaseError`) used in mutation `onError` callbacks.

### Empty States

We use a standardized `EmptyState` component for consistent UX when lists are empty.

- **Usage**: `src/components/ui/empty-state.tsx` provides presets like `EmptyStateNoTasks`, `EmptyStateNoProjects`.

## 4. Feature Modules

### Projects

- **Settings**: Managed via `ProjectSettings` page (admin only).
- **Members**: `ProjectMembers` component handles adding/removing users and changing roles (`viewer`, `member`, `admin`, `owner`).
- **Statuses**: Custom `project_statuses` managed per project.

### Tasks

- **Board/List**: Tasks can be viewed in Board (Kanban) or List modes.
- **Subtasks**: Implemented as a sub-collection, editable inline.
- **Time Entries**: Logs stored in `time_entries` linked to tasks.

### Activity & Notifications

- **Activity Feed**: Powered by `audit_logs` collection, filtered by project or task.
- **Real-time**: Subscribes to PocketBase SSE for live updates on tasks and activities.

## 5. Styling Conventions

- **Tailwind**: Utility-first styling.
- **Typography**:
  - Small Labels: `text-[10px] font-black tracking-[0.2em] uppercase`
  - Standard Text: `text-sm` or `text-[13px]`
- **Colors**: Semantic usage of `muted`, `primary`, `destructive` from the theme.
- **Components**: Shadcn components should be used as primitives. Avoid custom CSS/SCSS files.
