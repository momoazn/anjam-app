# Development Guide

## 🚀 Quick Start

### Prerequisites

- **Bun** 1.x (package manager and runtime)
- **Go** 1.24+ (for PocketBase backend)
- **Node.js** tools (via Bun)
- **Git** for version control

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd task-manager-app

# Install dependencies
bun install

# Start development servers
bun run dev  # Starts both frontend (5173) and backend (8090)
```

### Development Commands

```bash
# Development
bun run dev            # Full stack (client + server)
bun run dev:client     # Frontend only (port 5173)
bun run dev:server     # Backend only (port 8090)

# Building
bun run build          # Production build (client + server)
bun run build:client   # Frontend build only
bun run build:server   # Backend build only
bun run build:win      # Windows production build

# Quality Assurance
bun run check          # Type checking + linting + formatting check
bun run fix            # Auto-fix linting and formatting issues
bun run type:check     # TypeScript type checking only
bun run lint:check     # ESLint checking only
bun run fmt:check      # Prettier formatting check only

# Data Management
bun run seed:generate  # Generate mock data
bun run seed:truncate   # Clear database tables
bun run seed:insert     # Insert seed data
bun run seed           # Full database reset and seed
bun run gen:type        # Generate PocketBase TypeScript types

# Serving
bun run serve:client   # Preview built frontend
bun run serve:server   # Run backend server directly
```

## 🏗️ Project Structure

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # ShadcnUI base components
│   ├── forms/         # Form field components
│   ├── project/        # Project-specific components
│   ├── task/          # Task-specific components
│   ├── user/          # User management components
│   └── reports/       # Analytics components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks
├── lib/               # Utilities and configurations
├── store/             # Zustand state stores
├── constants/          # Application constants
└── types/             # TypeScript type definitions
```

### Backend Architecture

```
main.go               # PocketBase server setup
pb_schema.json        # Database schema definition
data/                # SQLite database files
scripts/             # Data seeding and utilities
```

## 🎯 Coding Standards

### File Naming Conventions

- **Components**: PascalCase (e.g., `TaskListItem.tsx`)
- **Files**: kebab-case (e.g., `task-list-item.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTaskFilters`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TASK_STATUS_OPTIONS`)
- **Utilities**: camelCase (e.g., `formatDateJalali`)

### Current File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # ShadcnUI base components
│   ├── forms/         # Form field components
│   ├── project/        # Project-specific components
│   ├── task/          # Task-specific components
│   ├── user/          # User management components
│   └── reports/       # Analytics components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks (distributed)
├── lib/               # Utilities and configurations
├── store/             # Zustand state stores
├── constants/          # Application constants
└── types/             # TypeScript type definitions
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **TypeScript**: Strict mode enabled
- **Imports**: Grouped and sorted

### Component Guidelines

```typescript
// Component structure example
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTaskFilters } from '@/hooks/use-task-filters';

interface TaskListProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  projectId,
  onTaskSelect,
}) => {
  const { tasks, loading } = useTaskFilters({ projectId });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onSelect={onTaskSelect}
        />
      ))}
    </div>
  );
};
```

## 🔧 State Management

### Zustand Stores

```typescript
// Example store structure
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    // Login logic
  },
  logout: () => {
    // Logout logic
  },
}));
```

### TanStack Query

```typescript
// Example hook usage
export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## 🎨 UI/UX Guidelines

### Design System

- **Framework**: ShadcnUI + TailwindCSS
- **Colors**: Professional blue/gray palette
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent 4px grid system
- **Responsive**: Desktop-first, mobile-optimized

### RTL Support

- Use `dir="rtl"` on root element
- Apply `ml-*` and `mr-*` classes correctly for RTL
- Convert digits with `digitsEnToFa()` utility
- Use Jalali calendar for date display

### Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

## 📱 Responsive Design

### Breakpoints

```css
/* TailwindCSS breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Approach

```typescript
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 🔒 Security Best Practices

### Input Validation

```typescript
// Example validation with Zod
const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  deadline: z.date().optional(),
});

// Usage
const validatedData = taskSchema.parse(inputData);
```

### API Security

```go
// PocketBase API rules example
// Users collection - only admins can manage other users
usersCollection.ListRule = "@request.auth.role = 'admin' || id = @request.auth.id"
usersCollection.CreateRule = "@request.auth.role = 'admin'"
usersCollection.UpdateRule = "@request.auth.role = 'admin' || id = @request.auth.id"
usersCollection.DeleteRule = "@request.auth.role = 'admin' || id = @request.auth.id"
```

### Frontend Security

- Sanitize user inputs
- Validate data on both client and server
- Use HTTPS in production
- Implement proper session management
- Avoid exposing sensitive data in console

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// Example test with Vitest
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  it('renders tasks correctly', () => {
    const tasks = [
      { id: '1', title: 'Test Task', status: 'todo' }
    ];

    render(<TaskList tasks={tasks} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### Integration Testing

- Test user workflows
- Verify API integrations
- Check state management
- Validate responsive behavior

### E2E Testing

- Use Playwright for browser automation
- Test critical user paths
- Verify cross-browser compatibility
- Check mobile functionality

## 🚀 Deployment

### Production Build

```bash
# Build frontend
bun run build:ui

# Build backend
bun run build:api

# Result: dist/ folder with embedded frontend
```

### Environment Variables

```bash
# .env.example
POCKETBASE_URL=http://localhost:8090
NODE_ENV=production
DATABASE_ENCRYPTION_KEY=your-encryption-key
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build:all

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/dist .
COPY --from=builder /app/data ./data
EXPOSE 8090
CMD ["./task-manager"]
```

## 🐛 Debugging

### Frontend Debugging

- Use React DevTools
- Check Network tab for API calls
- Console logging for state changes
- Breakpoints in browser dev tools

### Backend Debugging

- Check PocketBase admin panel
- Review API rules in database
- Monitor database queries
- Check server logs

### Common Issues

1. **CORS errors**: Check API origins configuration
2. **Authentication failures**: Verify token handling
3. **Permission denied**: Review API rules
4. **Build errors**: Check TypeScript types

## 📚 Resources

### Documentation

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [ShadcnUI Documentation](https://ui.shadcn.com/)

### Tools & Extensions

- **VS Code**: Recommended extensions list
- **Browser**: React DevTools, PocketBase Admin
- **Design**: Figma integration for UI mockups

---

**Last Updated**: 2025-10-28  
**Review Frequency**: Monthly  
**Maintainer**: Development Team
