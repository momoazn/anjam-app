# 🛠️ Organization Task Management Web App – Frontend Only

Build a **browser-based task management web application** tailored for internal organization operations.

> ✅ This is a **frontend-only** project — no backend, no database, no APIs  
> ✅ Use **mock data**, **local state**, and **localStorage** for persistence  
> ✅ Prioritize **clarity, simplicity, and maintainability** over complexity

---

## 🧱 Tech Stack

Use the following technologies:

- **React** (with TypeScript)
- **Vite** (for project scaffolding)
- **React Router** (for client-side routing)
- **Zustand** (for local/global state management)
- **React Query (TanStack Query)** (for managing mock async data)
- **TailwindCSS v4**
- **ShadCN UI** (for prebuilt, accessible UI components)

The app structure is already in place required packages installed.

---

## 🚀 Goal

Your task is to **develop and implement the full set of features** described below on top of the existing project. This is a **frontend-only**, browser-based, **desktop-first** application.

---

## 🖥️ UI Design

- **Desktop-first layout** — optimized primarily for organization desktop setups
- Use a **responsive grid** to support mobile/tablet views
- Use **neutral, professional colors**, clean typography, and high contrast for readability
- Consistent use of ShadCN UI components (modals, inputs, tables, alerts)

---

## 🎯 Core Features

### 👥 User Roles

Simulate 3 user roles:

- **Admin**

  - Activate/deactivate user accounts
  - Reset passwords (simulated)

- **Supervisor**

  - Manage weekly task assignments
  - Review reports

- **Employee**
  - View tasks
  - Submit/edit reports

Use a simple login screen that accepts just a **username** and a **role selector**. Store login session with **Zustand + localStorage**.

---

### 📌 Task Management

#### For Supervisors:

- Create/edit/delete **weekly tasks**
- Assign tasks to employees or departments
- Set **priority** and **deadlines**
- Task statuses: `Pending`, `In Progress`, `Completed`, `Overdue`
- Bulk task assignment (multi-select UI)

#### For Employees:

- View assigned tasks
- Submit or edit activity reports
- Add clarification comments
- Mark task completion status

---

### 📊 Reporting System

- Mock statistical reports for:
  - Task completion rate
  - Performance by employee
  - Activity by department
  - Weekly/monthly comparisons
- Filters:
  - Date range
  - Department
  - Employee
  - Status
  - Priority
- Report details should include:
  - Task breakdown
  - Time logs (mocked)
  - Status history
  - Attached documents (placeholder UI)

#### Export Options:

- Excel export with **SheetJS**
- PDF export with **jsPDF**
- Bulk export support

---

### 🔍 Search & Filter

- Global search across tasks and reports
- Filters:
  - Date range
  - Status
  - Priority
  - Department
  - Employee
  - Task type
- Users can **save filter presets** in `localStorage`

---

### 🔐 Simulated Security

Simulate basic security mechanisms:

- Login/logout session (Zustand + localStorage)
- Auto logout after 10 minutes of inactivity
- Fake audit log showing user events
- Export full app state as JSON (manual backup)

---

## 📁 Project Structure

Keep the structure **simple and flat**, following this structure:

src/
├── components/ # Reusable UI components (buttons, cards, inputs)
├── pages/ # One folder per route (e.g., Dashboard, Login)
├── routes/ # React Router setup and route definitions
├── store/ # Zustand stores
├── data/ # Static/mock JSON data
├── utils/ # Small helper functions
├── types/ # Global TypeScript types/interfaces
├── App.tsx # Root app shell with layout
├── main.tsx # Vite entry point

---

## 🧠 Coding & File Conventions

### ✅ General Practices

- Keep components small and focused
- Use **function components** and **React hooks**
- Prefer **colocation** of logic unless it grows too large
- Use **Zustand** for shared/global state only
- Use **React Query** for simulating async data (e.g., fetching mock reports)

### 📄 Naming Conventions

- Use **kebab-case** for filenames and folders  
  (e.g., `task-list.tsx`, `user-card.tsx`)
- Component names should be **PascalCase**
- Variables and functions: **camelCase**
- Use `.tsx` for components, `.ts` for logic/util files

---

## ❌ Avoid Overengineering

- ❌ Do not use feature-based modules
- ❌ Do not use Redux or Context API
- ❌ Do not over-abstract state logic or routing
- ❌ Do not create unnecessary layers or wrappers
- ❌ Do not manually create ShadcnUI components, install them using shadcn cli like this for button component: `pnpm dlx shadcn@latest add button`

---

## 🔚 Summary

- Use **React + React Router + Zustand + TailwindCSS** to simulate a task management SPA
- Desktop-first, responsive UI using Tailwind and ShadCN
- Simple login, task management, reporting, and export
- All data is **mocked and managed client-side**
- No backend: all data is mock, all state is client-side
- Prioritize **simplicity, clarity, and responsiveness**
- Export functionality, search, filtering, and role-based UI are core features
- Flat project structure with clear conventions
