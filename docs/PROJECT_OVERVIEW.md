# Task Manager Application - Project Overview

## 🎯 Project Summary

A **Persian-language task management web application** designed for internal organization operations with role-based access control, real-time collaboration, and comprehensive analytics.

## 🏗️ Technical Architecture

### Core Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Go + PocketBase (SQLite database)
- **UI Framework**: TailwindCSS v4 + ShadcnUI components
- **State Management**: Zustand (global) + TanStack Query (server state)
- **Build Tool**: Bun
- **Language**: RTL Persian interface with Jalali date support

### Application Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # ShadcnUI base components
│   ├── forms/         # Form components (task, project, user fields)
│   ├── project/       # Project-specific components
│   ├── task/          # Task-specific components
│   ├── user/          # User management components
│   └── reports/       # Analytics and reporting components
├── pages/             # Route pages
├── hooks/             # Custom React hooks
├── lib/              # Utilities and PocketBase setup
├── store/            # Zustand stores
└── constants/         # Application constants
```

## 👥 User Roles & Permissions

### Admin (مدیر کل)

- Full system access
- User management capabilities
- All project and task operations
- Complete analytics access

### Supervisor (ناظر)

- Create and manage own projects
- Task creation and assignment
- Team performance reports
- Limited user management

### Employee (کارمند)

- View assigned projects
- Manage assigned tasks
- Update task status
- Basic dashboard access

## ✅ Current Implementation Status

### Completed Features

- ✅ Authentication system with role-based access control
- ✅ Project CRUD operations with user assignments
- ✅ Task management with Kanban-style board
- ✅ User management (admin only)
- ✅ Basic reports and analytics dashboard
- ✅ Responsive design (desktop-first)
- ✅ Real-time notifications
- ✅ Persian RTL interface with Jalali dates
- ✅ Advanced filtering and search capabilities
- ✅ Mobile-optimized components
- ✅ Cross-user project visibility (with permissions)

### Known Issues

- ❌ Default superuser credentials if environment protection disabled
- 🟡 Cache invalidation may miss parameterized queries
- 🟡 Air hot reload configuration needs verification
- 🟡 Some accessibility warnings in console

## 📊 Data Model

### Core Collections

- **users**: User accounts with roles and profiles
- **projects**: Project management with user assignments
- **tasks**: Task management with status, priority, deadlines
- **userProjects**: Many-to-many relationship between users and projects

### Key Fields

- Tasks: `title`, `description`, `status`, `priority`, `deadline`, `assignee`, `project`, `tags`
- Projects: `name`, `description`, `status`, `users` (relation)
- Users: `email`, `name`, `role`, `avatar`

## 🔧 Development Environment

### Commands

- `bun run dev` - Full development (client + server)
- `bun run dev:client` - Frontend only (port 5173)
- `bun run dev:server` - Backend only (port 8090)
- `bun run build` - Production build (client + server)
- `bun run check` - Type checking and linting

### Database

- SQLite via PocketBase
- Schema defined in `pb_schema.json`
- Seed data available via `scripts/seed-data.ts`

## 🌐 Deployment Considerations

### Security Requirements

- Remove default superuser credentials
- Implement proper API rules
- Add session timeout policies
- Enable HTTPS in production

### Performance Optimizations

- Implement lazy loading for large datasets
- Add pagination for task lists
- Optimize database queries
- Enable caching strategies

## 📱 Accessibility & Internationalization

### RTL Support

- Full RTL layout support
- Persian digit conversion (`digitsEnToFa`)
- Jalali calendar integration
- Right-to-left text direction

### Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles

## 🚀 Next Steps

See `DEVELOPMENT_ROADMAP.md` for detailed implementation plans and `CRITICAL_ISSUES.md` for immediate action items.
