# Sidebar Enhancements - Implementation Plan

## 🎯 Overview

Transform the current static sidebar into a context-aware command center that improves navigation efficiency, personalization, and user experience.

## 📋 Current State

### Existing Features

- Static navigation items (Dashboard, Projects, Tasks, Users, Helps, Settings)
- Quick-create task button at top
- Basic role-based visibility (adminOnly, supervisorOnly flags)
- Collapsible sidebar with tooltips

### Limitations

- No submenus or saved views
- No recent items or bookmarks
- No search or quick actions
- No live badges or counts
- No keyboard shortcuts

## 🚀 Proposed Enhancements

### Phase 1: Core Navigation Improvements

#### 1. Project-Aware Submenu

**Description**: Replace single "Projects" link with expandable group
**Features**:

- Create Project quick action (+ button)
- Recent projects (top 5 by last visited)
- Starred projects (user-pinned)
- All Projects link
- Per-project sublinks (Tasks, Users)

**Technical Implementation**:

```typescript
interface ProjectSubmenuProps {
  projects: Project[];
  recentProjects: Project[];
  starredProjects: string[];
  onCreateProject: () => void;
}

// Store for starred projects
interface SidebarStore {
  starredProjects: string[];
  toggleStar: (projectId: string) => void;
}
```

#### 2. Saved Task Views

**Description**: Add task view shortcuts under Tasks menu
**Features**:

- Default views: My Tasks, Due Today, Overdue, In Progress
- Custom saved views with URL persistence
- Filter persistence via query parameters

**URL Structure**:

```
/tasks?assigned=me&status=open
/tasks?due=today
/tasks?due=overdue&priority=high
/tasks?status=in_progress
```

#### 3. Live Badges with Counts

**Description**: Show real-time counts next to menu items
**Features**:

- Tasks: My open tasks count, overdue count
- Projects: Per-project open task count
- Notifications: Unread count (if implemented)

**Implementation**:

```typescript
interface BadgeProps {
  count: number;
  variant?: "default" | "overdue" | "unread";
}

// Use React Query selectors for efficient updates
const taskCount = useQuery(["task-counts"], () => fetchTaskCounts());
```

#### 4. Centralized Permission Helper

**Description**: Replace ad-hoc role flags with systematic permissions
**Features**:

- Permission mapping: roles → permissions
- Consistent item visibility
- Tooltips for insufficient permissions

**Permission Matrix**:

```typescript
const PERMISSIONS = {
  tasks: {
    view: ["admin", "supervisor", "employee"],
    create: ["admin", "supervisor"],
  },
  projects: {
    view: ["admin", "supervisor", "employee"],
    manage: ["admin", "supervisor"],
  },
  users: { view: ["admin"], manage: ["admin"] },
  reports: { view: ["admin", "supervisor"] },
} as const;

function can(user: User, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role];
  return userPermissions?.includes(permission) || false;
}
```

#### 5. Quick Actions on Hover

**Description**: Add contextual action buttons
**Features**:

- Tasks row: Create task (+ button)
- Projects row: Create project (+ button)
- Keyboard-accessible with focus states

### Phase 2: Personalization Features

#### 6. Pinned Links (Bookmarks)

**Description**: User-customizable navigation shortcuts
**Features**:

- Star current route to add to pinned
- Drag to reorder pinned items
- Persist in localStorage/Zustand

**Store Structure**:

```typescript
interface PinnedLink {
  id: string;
  label: string;
  href: string;
  icon?: string;
  type: "project" | "tasks" | "custom";
}

interface SidebarStore {
  pinnedLinks: PinnedLink[];
  addPin: (link: PinnedLink) => void;
  removePin: (id: string) => void;
  reorderPins: (fromIndex: number, toIndex: number) => void;
}
```

#### 7. Recent Items

**Description**: Auto-populated list of visited routes
**Features**:

- Track last 10 visited routes
- Exclude duplicates
- Clear all option
- Auto-expire after 7 days

**Implementation**:

```typescript
// Route listener in app component
useEffect(() => {
  const handleRouteChange = () => {
    const currentPath = location.pathname;
    addToRecent({ href: currentPath, label: getPageTitle(currentPath) });
  };

  return router.subscribe(handleRouteChange);
}, []);
```

#### 8. Collapsible Groups with Persistence

**Description**: Remember expanded/collapsed state
**Features**:

- Persist group state in localStorage
- Default expansion rules
- Keyboard-accessible toggles

#### 9. Sidebar Search/Filter

**Description**: Inline search to filter menu items
**Features**:

- Real-time filtering as you type
- Keyboard Enter to navigate top match
- Clear button to reset filter

### Phase 3: Power User Features

#### 10. Keyboard Shortcuts

**Description**: Global shortcuts for navigation
**Shortcuts**:

- `Alt+1`: Dashboard
- `Alt+2`: Projects
- `Alt+3`: Tasks
- `Alt+4`: Users
- `Alt+5`: Reports
- `Arrow keys`: Expand/collapse focused group

**Implementation**:

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key >= "1" && event.key <= "5") {
      const routes = [
        "/dashboard",
        "/projects",
        "/tasks",
        "/users",
        "/reports",
      ];
      router.navigate(routes[parseInt(event.key) - 1]);
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

#### 11. Context Menus

**Description**: Right-click context menus
**Actions**:

- Pin/Unpin current route
- Copy link to clipboard
- Open in new tab
- Create under this context

#### 12. Feature Toggles

**Description**: Safe rollout of new features
**Implementation**:

```typescript
const FEATURE_FLAGS = {
  sidebarProjectsSubmenu: true,
  sidebarSavedViews: true,
  sidebarBadges: true,
  sidebarPinned: false, // Roll out gradually
  sidebarSearch: false,
} as const;
```

#### 13. External Resources Group

**Description**: Quick access to external links
**Default Links**:

- Documentation
- Support/Help
- Slack/Teams
- API docs

## 🏗️ Technical Architecture

### Component Structure

```
src/components/sidebar/
├── sidebar.tsx              # Main sidebar container
├── nav-main.tsx            # Primary navigation
├── nav-secondary.tsx        # Secondary navigation
├── nav-user.tsx             # User menu
├── sidebar-search.tsx        # Search functionality
├── project-submenu.tsx      # Projects expansion
├── saved-views.tsx          # Task saved views
├── pinned-links.tsx          # User bookmarks
├── recent-items.tsx          # Recent navigation
└── context-menu.tsx          # Right-click menu
```

### State Management

```typescript
// Zustand store for sidebar state
interface SidebarStore {
  // UI State
  isCollapsed: boolean;
  activeItem: string | null;

  // User Data
  starredProjects: string[];
  pinnedLinks: PinnedLink[];
  recentItems: RecentItem[];
  collapsedGroups: Record<string, boolean>;

  // Actions
  toggleCollapse: () => void;
  setActiveItem: (item: string) => void;
  toggleStar: (projectId: string) => void;
  addPin: (link: PinnedLink) => void;
  removePin: (id: string) => void;
  addToRecent: (item: RecentItem) => void;
  toggleGroup: (groupId: string) => void;
}
```

### Menu Configuration

```typescript
interface MenuItemConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItemConfig[];
  requiredPermissions?: string[];
  featureFlag?: string;
  badgeResolver?: () => number | null;
  quickActions?: ActionConfig[];
  contextMenuActions?: ActionConfig[];
}

// Example configuration
const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 'dashboard',
    title: 'داشبورد',
    icon: <LayoutDashboard />,
    href: '/dashboard',
    requiredPermissions: ['dashboard.view'],
  },
  {
    id: 'projects',
    title: 'پروژه‌ها',
    icon: <Folder />,
    requiredPermissions: ['projects.view'],
    children: [
      {
        id: 'projects-all',
        title: 'همه پروژه‌ها',
        href: '/projects',
      },
      // ... dynamic recent and starred projects
    ],
    quickActions: [
      { icon: <Plus />, label: 'ایجاد پروژه', action: 'create-project' }
    ]
  },
  // ... other menu items
];
```

## 📱 Responsive Considerations

### Desktop (>1024px)

- Full sidebar with text labels
- Hover states and tooltips
- Multi-column submenus

### Tablet (768px-1024px)

- Collapsible sidebar with icons
- Overlay submenus
- Touch-friendly targets

### Mobile (<768px)

- Bottom navigation bar
- Slide-up drawer for full menu
- Swipe gestures for navigation

## 🎨 Design Specifications

### Visual Hierarchy

- **Primary items**: High contrast, larger touch targets
- **Secondary items**: Medium contrast, standard size
- **Actions**: Subtle appearance on hover/focus
- **Badges**: Bright colors for counts (red for overdue)

### Animations

- **Collapse/Expand**: 200ms ease-in-out
- **Hover states**: 150ms ease-out
- **Badge updates**: 300ms bounce for new items

### Accessibility

- **Keyboard navigation**: Full tab and arrow key support
- **Screen readers**: ARIA labels and roles
- **Focus management**: Visible focus indicators
- **High contrast**: Support for high contrast mode

## 📊 Success Metrics

### User Experience

- **Navigation efficiency**: 25% reduction in clicks to common destinations
- **Discovery**: 40% increase in saved views usage
- **Personalization**: 60% of users customize sidebar

### Performance

- **Render time**: <16ms for sidebar updates
- **Memory usage**: <1MB for sidebar state
- **Bundle size**: <2KB additional JavaScript

### Engagement

- **Feature adoption**: Track usage of new features
- **User satisfaction**: Survey feedback on navigation
- **Task completion**: Measure impact on productivity

## 🔄 Implementation Timeline

### Phase 1 (Weeks 1-2)

- [ ] Permission helper system
- [ ] Project submenu implementation
- [ ] Saved task views
- [ ] Live badges for tasks
- [ ] Quick actions on hover

### Phase 2 (Weeks 3-4)

- [ ] Pinned links functionality
- [ ] Recent items tracking
- [ ] Collapsible groups persistence
- [ ] Sidebar search/filter
- [ ] Mobile responsive design

### Phase 3 (Weeks 5-6)

- [ ] Keyboard shortcuts
- [ ] Context menus
- [ ] Feature toggle system
- [ ] External resources section
- [ ] Performance optimization

## 🧪 Testing Strategy

### Unit Tests

- Permission helper functions
- Store state management
- Menu configuration logic
- Search/filter functionality

### Integration Tests

- Navigation flows
- Permission-based visibility
- State persistence
- Responsive behavior

### E2E Tests

- Complete user journeys
- Keyboard navigation
- Mobile touch interactions
- Cross-browser compatibility

### Accessibility Tests

- Screen reader compatibility
- Keyboard-only navigation
- High contrast mode
- Voice control support

---

**Last Updated**: 2025-10-28  
**Priority**: Medium - Enhancement project  
**Next Review**: 2025-11-11
