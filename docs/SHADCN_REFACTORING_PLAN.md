# Rebuild All Components on Shadcn UI Foundation - Clarified Plan

## Overview

Refactor all components and pages to exclusively use **standard shadcn UI components** from `src/components/ui/`. Custom components in the ui directory (like `empty-state.tsx`, `metric-card.tsx`) must be refactored to use only standard shadcn components. All interactive elements must use shadcn, and all presentational components must use shadcn equivalents.

## Key Decisions & Rules

### 1. Component Classification

- **Standard shadcn components**: Only components from the official shadcn/ui registry are allowed
- **Custom ui/ components**: Components like `empty-state.tsx`, `metric-card.tsx`, `delete-dialog.tsx` in `ui/` directory need refactoring to use only standard shadcn primitives
- **Wrapper components**: Evaluate case-by-case - keep if they add significant value, refactor if thin wrappers

### 2. Interactive Elements

- **Buttons**: All `<button>` → `<Button>` from `@/components/ui/button`
- **Inputs**: All `<input>` → `<Input>` from `@/components/ui/input`
- **Selects**: All `<select>` → `<Select>` from `@/components/ui/select`
- **Textareas**: All `<textarea>` → `<Textarea>` from `@/components/ui/textarea`
- **Forms**: Use shadcn `<Form>`, `<FormField>`, `<FormLabel>`, `<FormItem>` - replace native `<form>` and `<label>` tags

### 3. Presentational Components

- **All presentational components** must use shadcn equivalents:
  - Loading states → `<Skeleton>` from `@/components/ui/skeleton`
  - Card containers → `<Card>`, `<CardHeader>`, `<CardContent>` from `@/components/ui/card`
  - Empty states → Compose from `<Card>` and shadcn components
  - Layout wrappers → Use shadcn components where applicable

### 4. Third-Party Libraries

- **Compose from shadcn** where possible
- **Use third-party only for core functionality**:
  - `@dnd-kit`: Use for drag-and-drop logic, but wrap drag handles in shadcn `<Button>`
  - `recharts`: Use for chart rendering, but wrap in shadcn `<Card>` and use shadcn `<ChartContainer>`
  - Ensure any buttons/inputs in third-party integrations use shadcn components

### 5. Native HTML Elements

- **Semantic HTML**: Keep `<section>`, `<article>`, `<header>`, `<main>`, `<nav>`, `<footer>` as-is (not interactive)
- **Form elements**: Replace with shadcn Form components
- **Layout divs**: Keep simple layout `<div>` containers as-is (hybrid approach)

### 6. Styling

- **Use shadcn default styling** - rely on component variants
- **Minimal custom classes** - only for brand-specific styling that shadcn doesn't support
- **Preserve existing Tailwind classes** only when necessary for brand consistency

### 7. Accessibility

- **Rely on shadcn built-in accessibility** - shadcn components have proper ARIA attributes
- **Add custom accessibility attributes** only when shadcn doesn't provide needed functionality

### 8. Event Handlers

- **Pass directly as props** - shadcn components accept standard React event handlers (onClick, onKeyDown, etc.)

### 9. Icons

- **No change needed** - icon components from lucide-react, @tabler/icons-react, @phosphor-icons/react are fine as-is

### 10. Testing

- **Maintain all existing tests** - ensure they still pass after refactoring
- Update test selectors if shadcn components use different structure

## Phase 1: Refactor Custom UI Components

### 1.1 Custom Components in ui/ Directory

- **[src/components/ui/empty-state.tsx](src/components/ui/empty-state.tsx)**: Already uses Card, verify it only uses standard shadcn components
- **[src/components/ui/metric-card.tsx](src/components/ui/metric-card.tsx)**: Already uses Card, verify it only uses standard shadcn components
- **[src/components/ui/delete-dialog.tsx](src/components/ui/delete-dialog.tsx)**: Already uses AlertDialog, verify it only uses standard shadcn components
- **[src/components/ui/file-upload.tsx](src/components/ui/file-upload.tsx)**: Verify uses only standard shadcn components

## Phase 2: Refactor Pages (Pages First Approach)

### 2.1 Core Pages

- **[src/pages/dashboard.tsx](src/pages/dashboard.tsx)**: Verify all child components use shadcn, refactor as needed
- **[src/pages/tasks.tsx](src/pages/tasks.tsx)**: Verify all child components use shadcn, refactor as needed
- **[src/pages/my-tasks.tsx](src/pages/my-tasks.tsx)**: Verify all child components use shadcn, refactor as needed
- **[src/pages/task-details.tsx](src/pages/task-details.tsx)**: Verify all child components use shadcn, refactor as needed
- **[src/pages/projects.tsx](src/pages/projects.tsx)**: Verify all child components use shadcn, refactor as needed
- **[src/pages/project-details.tsx](src/pages/project-details.tsx)**: Verify all child components use shadcn, refactor as needed

### 2.2 Form Pages

- **[src/pages/create-task.tsx](src/pages/create-task.tsx)**: Ensure uses shadcn Form components exclusively
- **[src/pages/edit-task.tsx](src/pages/edit-task.tsx)**: Ensure uses shadcn Form components exclusively
- **[src/pages/create-project.tsx](src/pages/create-project.tsx)**: Ensure uses shadcn Form components exclusively
- **[src/pages/edit-project.tsx](src/pages/edit-project.tsx)**: Ensure uses shadcn Form components exclusively
- **[src/pages/create-user.tsx](src/pages/create-user.tsx)**: Ensure uses shadcn Form components exclusively
- **[src/pages/edit-user.tsx](src/pages/edit-user.tsx)**: Ensure uses shadcn Form components exclusively

### 2.3 Other Pages

- **[src/pages/users.tsx](src/pages/users.tsx)**: Verify uses Table and other shadcn components
- **[src/pages/settings.tsx](src/pages/settings.tsx)**: Verify uses shadcn components
- **[src/pages/reports.tsx](src/pages/reports.tsx)**: Verify uses shadcn components
- **[src/pages/notifications.tsx](src/pages/notifications.tsx)**: Verify uses shadcn components
- **[src/pages/task-board.tsx](src/pages/task-board.tsx)**: Verify drag-and-drop uses shadcn Button for handles
- **[src/pages/task-calendar.tsx](src/pages/task-calendar.tsx)**: Verify uses shadcn Calendar component

## Phase 3: Refactor Task Components

### 3.1 Task List & Display

- **[src/components/task/task-list-item.tsx](src/components/task/task-list-item.tsx)**: Replace `<button>` with Button component
- **[src/components/task/board/board-card.tsx](src/components/task/board/board-card.tsx)**: Replace `<button>` with Button, ensure dnd-kit drag handles use Button
- **[src/components/task/board/board-column.tsx](src/components/task/board/board-column.tsx)**: Verify uses shadcn components
- **[src/components/task/task-header.tsx](src/components/task/task-header.tsx)**: Replace all buttons/inputs with shadcn
- **[src/components/task/task-details-header.tsx](src/components/task/task-details-header.tsx)**: Replace buttons/inputs with shadcn
- **[src/components/task/task-list-view.tsx](src/components/task/task-list-view.tsx)**: Verify uses shadcn components
- **[src/components/task/task-list-skeleton.tsx](src/components/task/task-list-skeleton.tsx)**: Ensure uses Skeleton component
- **[src/components/task/task-empty-state.tsx](src/components/task/task-empty-state.tsx)**: Compose from Card and shadcn components
- **[src/components/task/my-tasks-empty-state.tsx](src/components/task/my-tasks-empty-state.tsx)**: Compose from Card and shadcn components
- **[src/components/task/my-tasks-skeleton.tsx](src/components/task/my-tasks-skeleton.tsx)**: Ensure uses Skeleton component

### 3.2 Task Actions & Filters

- **[src/components/task/bulk-actions-bar.tsx](src/components/task/bulk-actions-bar.tsx)**: Ensure all buttons use Button component
- **[src/components/task/task-filters.tsx](src/components/task/task-filters.tsx)**: Replace inputs/buttons with shadcn
- **[src/components/task/task-filters-panel.tsx](src/components/task/task-filters-panel.tsx)**: Verify uses Sheet/Drawer and shadcn inputs
- **[src/components/task/my-tasks-header.tsx](src/components/task/my-tasks-header.tsx)**: Rebuild using Card and Button components
- **[src/components/task/task-pagination.tsx](src/components/task/task-pagination.tsx)**: Verify uses Pagination component

### 3.3 Task Details & Comments

- **[src/components/task/task-details-content.tsx](src/components/task/task-details-content.tsx)**: Replace inputs/buttons with shadcn
- **[src/components/task/task-details-sidebar.tsx](src/components/task/task-details-sidebar.tsx)**: Verify uses shadcn components
- **[src/components/task/task-details-skeleton.tsx](src/components/task/task-details-skeleton.tsx)**: Ensure uses Skeleton component
- **[src/components/task/comment-composer.tsx](src/components/task/comment-composer.tsx)**: Replace inputs/buttons with shadcn
- **[src/components/task/comment-item.tsx](src/components/task/comment-item.tsx)**: Verify uses shadcn components
- **[src/components/task/comments-list.tsx](src/components/task/comments-list.tsx)**: Verify uses shadcn components

### 3.4 Task Dialogs & Forms

- **[src/components/task/time-entry-dialog.tsx](src/components/task/time-entry-dialog.tsx)**: Verify uses Dialog and Form components
- **[src/components/task/save-filter-dialog.tsx](src/components/task/save-filter-dialog.tsx)**: Verify uses Dialog and Form components
- **[src/components/task/manage-saved-filters-dialog.tsx](src/components/task/manage-saved-filters-dialog.tsx)**: Verify uses Dialog component

## Phase 4: Refactor Dashboard Widgets

### 4.1 Widget Components

- **[src/components/dashboard/stats-widget.tsx](src/components/dashboard/stats-widget.tsx)**: Already uses Card, verify all elements are shadcn-based
- **[src/components/dashboard/dashboard-header.tsx](src/components/dashboard/dashboard-header.tsx)**: Replace custom elements with shadcn
- **[src/components/dashboard/projects-widget.tsx](src/components/dashboard/projects-widget.tsx)**: Verify and refactor as needed
- **[src/components/dashboard/productivity-widget.tsx](src/components/dashboard/productivity-widget.tsx)**: Verify and refactor as needed
- **[src/components/dashboard/overdue-tasks-widget.tsx](src/components/dashboard/overdue-tasks-widget.tsx)**: Verify and refactor as needed
- **[src/components/dashboard/charts-widget.tsx](src/components/dashboard/charts-widget.tsx)**: Ensure recharts wrapped in Card, verify uses ChartContainer
- **[src/components/dashboard/welcome-widget.tsx](src/components/dashboard/welcome-widget.tsx)**: Verify and refactor as needed

## Phase 5: Refactor Project Components

### 5.1 Project Display

- **[src/components/project/project-header.tsx](src/components/project/project-header.tsx)**: Replace all buttons/inputs with shadcn components
- **[src/components/project/project-details-sections.tsx](src/components/project/project-details-sections.tsx)**: Ensure Textarea and other inputs use shadcn
- **[src/components/project/project-list-group.tsx](src/components/project/project-list-group.tsx)**: Verify interactive elements use shadcn
- **[src/components/project/project-details-skeleton.tsx](src/components/project/project-details-skeleton.tsx)**: Ensure uses Skeleton component
- **[src/components/project/project-sidebar.tsx](src/components/project/project-sidebar.tsx)**: Verify uses shadcn components

### 5.2 Project Actions

- **[src/components/project/add-project-member-modal.tsx](src/components/project/add-project-member-modal.tsx)**: Verify uses Dialog and Form components
- **[src/components/project/delete-project-dialog.tsx](src/components/project/delete-project-dialog.tsx)**: Verify uses AlertDialog
- **[src/components/project/project-members.tsx](src/components/project/project-members.tsx)**: Verify uses shadcn components
- **[src/components/project/project-statuses-settings.tsx](src/components/project/project-statuses-settings.tsx)**: Verify uses shadcn components

## Phase 6: Refactor Forms

### 6.1 Form Components

- **[src/components/forms/form-field.tsx](src/components/forms/form-field.tsx)**: Already uses shadcn Form components, verify completeness
- **[src/components/forms/task-fields.tsx](src/components/forms/task-fields.tsx)**: Verify all inputs/selects use shadcn, replace native form/label tags
- **[src/components/forms/project-fields.tsx](src/components/forms/project-fields.tsx)**: Verify all inputs use shadcn, replace native form/label tags
- **[src/components/forms/user-fields.tsx](src/components/forms/user-fields.tsx)**: Verify all inputs use shadcn, replace native form/label tags
- **[src/components/forms/time-estimate-fields.tsx](src/components/forms/time-estimate-fields.tsx)**: Verify uses shadcn components

## Phase 7: Refactor Navigation & Layout

### 7.1 Navigation Components

- **[src/components/nav-main.tsx](src/components/nav-main.tsx)**: Verify uses shadcn navigation components
- **[src/components/nav-user.tsx](src/components/nav-user.tsx)**: Verify uses shadcn components
- **[src/components/site-header.tsx](src/components/site-header.tsx)**: Replace custom elements with shadcn
- **[src/components/header-user-menu.tsx](src/components/header-user-menu.tsx)**: Ensure uses DropdownMenu
- **[src/components/app-sidebar.tsx](src/components/app-sidebar.tsx)**: Already uses Sidebar components, verify completeness

### 7.2 Layout Components

- **[src/components/page-header.tsx](src/components/page-header.tsx)**: Rebuild using Card, Separator, and Button shadcn components
- **[src/components/page-transition.tsx](src/components/page-transition.tsx)**: Verify only uses shadcn if it has interactive elements
- **[src/components/route-skeleton.tsx](src/components/route-skeleton.tsx)**: Ensure uses Skeleton component
- **[src/components/scroll-to-top.tsx](src/components/scroll-to-top.tsx)**: Verify uses Button component

### 7.3 Sidebar Components

- **[src/components/sidebar/quick-create.tsx](src/components/sidebar/quick-create.tsx)**: Verify uses shadcn components
- **[src/components/sidebar/projects-submenu.tsx](src/components/sidebar/projects-submenu.tsx)**: Verify uses shadcn
- **[src/components/sidebar/task-views.tsx](src/components/sidebar/task-views.tsx)**: Verify uses shadcn components

## Phase 8: Refactor Feature Components

### 8.1 Notifications

- **[src/components/notifications/notification-item.tsx](src/components/notifications/notification-item.tsx)**: Replace buttons with Button component
- **[src/components/notifications/notification-list.tsx](src/components/notifications/notification-list.tsx)**: Verify uses shadcn
- **[src/components/notifications/notification-filters.tsx](src/components/notifications/notification-filters.tsx)**: Verify uses shadcn
- **[src/components/notification-dropdown.tsx](src/components/notification-dropdown.tsx)**: Ensure uses DropdownMenu
- **[src/components/notification-badge.tsx](src/components/notification-badge.tsx)**: Verify uses Badge component

### 8.2 Reports

- **[src/components/reports/filters-bar.tsx](src/components/reports/filters-bar.tsx)**: Replace inputs/buttons with shadcn
- **[src/components/reports/filters-section.tsx](src/components/reports/filters-section.tsx)**: Verify uses shadcn
- **[src/components/reports/metric-cards.tsx](src/components/reports/metric-cards.tsx)**: Verify uses Card components
- **[src/components/reports/metrics-section.tsx](src/components/reports/metrics-section.tsx)**: Verify uses shadcn
- **[src/components/reports/employee-performance-table.tsx](src/components/reports/employee-performance-table.tsx)**: Verify uses Table component
- **[src/components/reports/charts-section.tsx](src/components/reports/charts-section.tsx)**: Verify recharts wrapped in Card, uses ChartContainer
- **[src/components/reports/priority-distribution.tsx](src/components/reports/priority-distribution.tsx)**: Verify uses ChartContainer
- **[src/components/reports/timeliness-donut.tsx](src/components/reports/timeliness-donut.tsx)**: Verify uses ChartContainer
- **[src/components/reports/throughput-chart.tsx](src/components/reports/throughput-chart.tsx)**: Verify uses ChartContainer
- **[src/components/reports/workload-distribution-chart.tsx](src/components/reports/workload-distribution-chart.tsx)**: Verify uses ChartContainer
- **[src/components/reports/productivity-trends-chart.tsx](src/components/reports/productivity-trends-chart.tsx)**: Verify uses ChartContainer
- **[src/components/reports/employee-productivity-chart.tsx](src/components/reports/employee-productivity-chart.tsx)**: Verify uses ChartContainer and Select
- **[src/components/reports/employee-comparison-chart.tsx](src/components/reports/employee-comparison-chart.tsx)**: Verify uses ChartContainer
- **[src/components/reports/overtime-analysis-chart.tsx](src/components/reports/overtime-analysis-chart.tsx)**: Verify uses ChartContainer
- **[src/components/reports/employee-overview-cards.tsx](src/components/reports/employee-overview-cards.tsx)**: Verify uses Card components
- **[src/components/reports/leaderboard.tsx](src/components/reports/leaderboard.tsx)**: Verify uses shadcn components
- **[src/components/reports/drilldown-drawer.tsx](src/components/reports/drilldown-drawer.tsx)**: Verify uses Drawer component
- **[src/components/reports/table-section.tsx](src/components/reports/table-section.tsx)**: Verify uses Table component
- **[src/components/reports/project-export-button.tsx](src/components/reports/project-export-button.tsx)**: Verify uses Button component

### 8.3 Settings

- **[src/components/settings/profile-section.tsx](src/components/settings/profile-section.tsx)**: Replace inputs/buttons with shadcn, use Form components
- **[src/components/settings/security-section.tsx](src/components/settings/security-section.tsx)**: Replace inputs/buttons with shadcn, use Form components
- **[src/components/settings/appearance-section.tsx](src/components/settings/appearance-section.tsx)**: Verify uses shadcn components
- **[src/components/settings/preferences-section.tsx](src/components/settings/preferences-section.tsx)**: Verify uses shadcn components
- **[src/components/settings/about-section.tsx](src/components/settings/about-section.tsx)**: Verify uses shadcn components
- **[src/components/settings/settings-sidebar.tsx](src/components/settings/settings-sidebar.tsx)**: Verify uses shadcn components

### 8.4 Tags

- **[src/components/tags/tags-list.tsx](src/components/tags/tags-list.tsx)**: Replace buttons with Button component
- **[src/components/tags/tags-header.tsx](src/components/tags/tags-header.tsx)**: Verify uses shadcn components
- **[src/components/tags/tag-form-dialog.tsx](src/components/tags/tag-form-dialog.tsx)**: Verify uses Dialog and Form components
- **[src/components/tags/tags-delete-dialog.tsx](src/components/tags/tags-delete-dialog.tsx)**: Verify uses AlertDialog

### 8.5 Users

- **[src/components/user/user-list-table.tsx](src/components/user/user-list-table.tsx)**: Verify uses Table component
- **[src/components/user/delete-user-dialog.tsx](src/components/user/delete-user-dialog.tsx)**: Verify uses AlertDialog
- **[src/components/user/user-login-logs-dialog.tsx](src/components/user/user-login-logs-dialog.tsx)**: Verify uses Dialog and Table components

### 8.6 Other Features

- **[src/components/global-search.tsx](src/components/global-search.tsx)**: Verify uses Command component
- **[src/components/comments/mention-autocomplete.tsx](src/components/comments/mention-autocomplete.tsx)**: Verify uses Command/Combobox components
- **[src/components/audit/activity-stream.tsx](src/components/audit/activity-stream.tsx)**: Verify uses shadcn components
- **[src/components/organization/org-switcher.tsx](src/components/organization/org-switcher.tsx)**: Verify uses shadcn components
- **[src/components/help/help-header.tsx](src/components/help/help-header.tsx)**: Verify uses shadcn components
- **[src/components/help/help-categories.tsx](src/components/help/help-categories.tsx)**: Verify uses shadcn components
- **[src/components/help/help-article.tsx](src/components/help/help-article.tsx)**: Verify uses shadcn components

## Phase 9: Wrapper Components Evaluation

### 9.1 Evaluate Wrapper Components

- **[src/components/user-avatar.tsx](src/components/user-avatar.tsx)**: Already wraps Avatar - evaluate if it adds value or should be refactored
- **[src/components/forms/form-field.tsx](src/components/forms/form-field.tsx)**: Wraps FormField - evaluate if it adds significant value
- Other wrapper components: Evaluate case-by-case

## Implementation Guidelines

### Component Replacement Rules

1. **Button Replacement**:

   ```tsx
   // ❌ Before
   <button onClick={handleClick} className="...">Click</button>

   // ✅ After
   <Button onClick={handleClick} className="...">Click</Button>
   ```

2. **Input Replacement**:

   ```tsx
   // ❌ Before
   <input type="text" value={value} onChange={onChange} />

   // ✅ After
   <Input type="text" value={value} onChange={onChange} />
   ```

3. **Form Replacement**:

   ```tsx
   // ❌ Before
   <form onSubmit={handleSubmit}>
     <label>Name</label>
     <input name="name" />
   </form>

   // ✅ After
   <Form onSubmit={handleSubmit}>
     <FormField name="name">
       <FormLabel>Name</FormLabel>
       <FormControl>
         <Input />
       </FormControl>
     </FormField>
   </Form>
   ```

4. **Card Container**:

   ```tsx
   // ❌ Before
   <div className="border p-4 rounded">
     <h2>Title</h2>
     <p>Content</p>
   </div>

   // ✅ After
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>
       <p>Content</p>
     </CardContent>
   </Card>
   ```

5. **Skeleton Loading**:

   ```tsx
   // ❌ Before
   <div className="h-4 w-20 bg-gray-200 animate-pulse" />

   // ✅ After
   <Skeleton className="h-4 w-20" />
   ```

6. **Third-Party Integration**:

   ```tsx
   // ✅ dnd-kit with shadcn Button
   <Button {...attributes} {...listeners} ref={setNodeRef}>
     Drag Handle
   </Button>

   // ✅ recharts with shadcn Card
   <Card>
     <CardHeader>
       <CardTitle>Chart</CardTitle>
     </CardHeader>
     <CardContent>
       <ChartContainer config={config}>
         <BarChart data={data}>...</BarChart>
       </ChartContainer>
     </CardContent>
   </Card>
   ```

### Styling Guidelines

- Use shadcn component variants (default, outline, ghost, etc.)
- Apply minimal custom Tailwind classes only for brand-specific styling
- Preserve existing className props but prefer shadcn variants
- Use `cn()` utility for conditional classes

### Testing Guidelines

- Maintain all existing tests
- Update test selectors if shadcn components use different structure
- Test interactive elements to ensure functionality is preserved
- Verify accessibility attributes are maintained

## Verification Checklist

- [ ] All `<button>` elements replaced with `<Button>`
- [ ] All `<input>` elements replaced with `<Input>` or appropriate shadcn component
- [ ] All `<select>` elements replaced with `<Select>`
- [ ] All `<textarea>` elements replaced with `<Textarea>`
- [ ] All native `<form>` and `<label>` replaced with shadcn Form components
- [ ] All loading states use `<Skeleton>` component
- [ ] All card-like containers use `<Card>` component
- [ ] All dialogs use `<Dialog>` or `<AlertDialog>`
- [ ] All dropdowns use `<DropdownMenu>`
- [ ] All tables use `<Table>` component
- [ ] All third-party integrations wrapped with shadcn components
- [ ] Custom ui/ components refactored to use only standard shadcn
- [ ] All tests pass
- [ ] No custom HTML interactive elements remain
- [ ] All components import from `@/components/ui/*`

## Notes

- Semantic HTML elements (`<section>`, `<article>`, `<header>`, etc.) are kept as-is
- Icon components remain unchanged
- Layout `<div>` containers are kept as-is (hybrid approach)
- Event handlers pass directly as props to shadcn components
- Accessibility relies on shadcn built-in attributes
- Wrapper components evaluated case-by-case for value
