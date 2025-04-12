# 🛠️ Organization Task Management Web App

Build a **browser-based task management web application** tailored for internal organization operations.

> ✅ This is a **full-stack** project with PocketBase backend  
> ✅ Use **real-time data sync** and **optimistic updates**  
> ✅ Prioritize **clarity, simplicity, and maintainability**

---

## 🧱 Tech Stack

Use the following technologies:

- **React** (with TypeScript)
- **Vite** (for project scaffolding)
- **React Router** (for client-side routing)
- **Zustand** (for local/global state management)
- **React Query (TanStack Query)** (for server state management)
- **TailwindCSS v4**
- **ShadCN UI** (for prebuilt, accessible UI components)
- **PocketBase** (for backend and real-time features)

The app structure is already in place with required packages installed.

---

## 🚀 Goal

Your task is to **develop and implement the full set of features** described below. This is a **full-stack application** with real-time capabilities, focusing on a great user experience.

---

## 🖥️ UI Design

- **Desktop-first layout** — optimized primarily for organization desktop setups
- Use a **responsive grid** to support mobile/tablet views
- Use **neutral, professional colors**, clean typography, and high contrast for readability
- Consistent use of ShadCN UI components (modals, inputs, tables, alerts)
- Real-time updates and notifications

---

## 🎯 Core Features

### 👥 User Roles

Implement 3 user roles with PocketBase:

- **Admin**
  - Manage user accounts
  - Reset passwords
  - Full system access

- **Supervisor**
  - Manage projects and tasks
  - Review team performance
  - Generate reports

- **Employee**
  - View assigned projects
  - Manage tasks
  - Submit updates

Use PocketBase authentication with role-based access control.

---

### 📌 Project Management

#### For Supervisors:

- Create/edit/delete projects
- Assign users to projects
- Monitor project progress
- Real-time project updates

#### For Employees:

- View assigned projects
- Track project tasks
- Receive project notifications
- Submit project updates

---

### 📋 Task Management

#### For Supervisors:

- Create/edit/delete tasks
- Assign tasks to employees
- Set priorities and deadlines
- Monitor task progress
- Bulk task operations

#### For Employees:

- View assigned tasks
- Update task status
- Add task comments
- Track time spent

---

### 📊 Reporting System

- Generate reports for:
  - Project progress
  - Task completion
  - Team performance
  - Time tracking
- Export options:
  - Excel export
  - PDF export
  - Bulk export

---

### 🔍 Search & Filter

- Global search across projects and tasks
- Advanced filtering options:
  - Date range
  - Status
  - Priority
  - Assignee
  - Project
- Save filter presets

---

### 🔔 Real-time Features

- Live updates for:
  - Project changes
  - Task updates
  - Comments
  - Assignments
- Desktop notifications
- Activity feed
- Online presence

---

## 📁 Project Structure

Keep the structure **clean and organized**:

```
src/
├── components/     # UI components
│   ├── ui/        # ShadcnUI components
│   ├── project/   # Project components
│   ├── task/      # Task components
│   └── layout/    # Layout components
├── pages/         # Route pages
├── store/         # Zustand stores
├── hooks/         # Custom hooks
├── lib/           # PocketBase setup
├── utils/         # Helper functions
└── types/         # TypeScript types
```

---

## 🧠 Development Guidelines

### ✅ General Practices

- Use **function components** and hooks
- Implement **real-time updates**
- Follow **TypeScript best practices**
- Write **clean, maintainable code**
- Use **PocketBase features** effectively

### 📄 File Conventions

- Use **kebab-case** for files
- **PascalCase** for components
- **camelCase** for variables
- `.tsx` for components
- `.ts` for utilities

---

## ❌ Avoid Overengineering

- ❌ Complex state management
- ❌ Unnecessary abstractions
- ❌ Over-optimization
- ❌ Manual ShadcnUI components
- ❌ Complex folder structures

---

## 🔚 Summary

- Full-stack app with **React + PocketBase**
- Real-time features and notifications
- Role-based access control
- Project and task management
- Clean, maintainable architecture
- Focus on user experience
- Efficient data synchronization
