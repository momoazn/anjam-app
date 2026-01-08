# Anjam - Feature Specifications

This document outlines the specifications for features identified during codebase analysis that require implementation.

---

## 1. Advanced Task Filtering UI

### Overview

Add a comprehensive filtering interface to the tasks page that allows users to create complex filter combinations using AND/OR logic, date range presets, and advanced assignee/group selection.

### Location

- **Frontend Component**: `src/components/task/advanced-filters-panel.tsx` (new)
- **Hooks**: `src/hooks/use-advanced-filters.ts` (new)
- **Constants**: Update `src/constants/tasks.ts`
- **Page**: `src/pages/tasks.tsx`

### Requirements

#### Filter Types

| Filter         | Type                | Options                                    |
| -------------- | ------------------- | ------------------------------------------ |
| Status         | Multi-select        | All statuses with checkbox selection       |
| Priority       | Multi-select        | urgent, high, medium, low                  |
| Assignee       | Searchable dropdown | All users + "Unassigned" + "Me"            |
| Assignee Group | Multi-select        | Groups/teams                               |
| Project        | Multi-select        | All projects user has access to            |
| Tags           | Multi-select        | All available tags                         |
| Date Range     | Presets + custom    | today, week, month, overdue, custom range  |
| Deadline       | Date picker         | Before/after/on specific date              |
| Created        | Date range          | Date range with presets                    |
| Updated        | Date range          | Date range with presets                    |
| Search         | Text                | Full-text search across title, description |

#### Advanced Features

- **Filter Groups**: Combine filters with AND/OR logic
  ```typescript
  // Example: (status=todo OR status=in_progress) AND priority=high
  {
    logic: 'OR',
    groups: [
      { filters: [{ field: 'status', operator: '=', value: 'todo' }] },
      { filters: [{ field: 'status', operator: '=', value: 'in_progress' }] }
    ]
  }
  ```
- **Save Filter Presets**: Save complex filter combinations
- **Quick Filters**: Pre-built filters (My Tasks, Overdue, Due Today, etc.)
- **Filter Summary**: Show active filter summary in header

#### UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Filters                              [Save Preset] [Reset] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Quick Filters ─────────────────────────────────────────┐│
│  │ [My Tasks] [Overdue] [Due Today] [Due This Week]        ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ Status ───────────────────┐ ┌─ Priority ───────────────┐│
│  │ [ ] Todo                   │ │ [ ] Urgent               ││
│  │ [ ] In Progress            │ │ [ ] High                 ││
│  │ [ ] Waiting                │ │ [ ] Medium               ││
│  │ [ ] Review                 │ │ [ ] Low                  ││
│  │ [ ] Done                   │ │                          ││
│  │ [ ] Canceled               │ │                          ││
│  └────────────────────────────┘ └──────────────────────────┘│
│                                                             │
│  ┌─ Date Range ─────────────────┐ ┌─ Assignee ─────────────┐│
│  │ [Today] [Week] [Month]       │ │ [Search users...]       ││
│  │ [Custom Range ▾]             │ │ [ ] Show unassigned     ││
│  │                              │ │ [ ] Only my tasks       ││
│  └──────────────────────────────┘ └────────────────────────┘│
│                                                             │
│  ┌─ Projects ───────────────────┐ ┌─ Tags ─────────────────┐│
│  │ [Search projects...]         │ │ [Search tags...]        ││
│  │ [ ] Select all / Deselect    │ │ [ ] Select all          ││
│  │ [ ] Project A                │ │ [ ] Bug                 ││
│  │ [ ] Project B                │ │ [ ] Feature             ││
│  │ [ ] Project C                │ │ [ ] Urgent              ││
│  └──────────────────────────────┘ └────────────────────────┘│
│                                                             │
│  ┌─ Search ────────────────────────────────────────────────┐│
│  │ [ __________________________________________________ ] ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│                          [Apply Filters] [Clear All]        │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Create AdvancedFiltersPanel component**
   - Implement filter state management
   - Add filter group builder UI
   - Connect to existing `useTaskFilters` hook

2. **Extend useTaskFilters hook**
   - Add advanced filter support
   - Parse filter groups to Convex query syntax

3. **Update Tasks page**
   - Integrate AdvancedFiltersPanel alongside existing TaskFiltersPanel
   - Toggle between basic and advanced views

4. **Add filter preset persistence**
   - Store presets in localStorage or database
   - Quick access from filter panel

### Filter Query Syntax (Convex)

```typescript
function buildFilterQuery(filters: AdvancedFilters): string {
  const parts: string[] = [];

  // Handle filter groups
  if (filters.groups && filters.groups.length > 0) {
    const groupExpressions = filters.groups.map((group) => {
      const groupParts = group.filters.map((f) => {
        return buildSimpleFilter(f);
      });
      return `(${groupParts.join(" && ")})`;
    });
    parts.push(`(${groupExpressions.join(` ${filters.logic} `)})`);
  }

  // Simple filters
  filters.simple?.forEach((f) => {
    parts.push(buildSimpleFilter(f));
  });

  return parts.join(" && ");
}

function buildSimpleFilter(filter: Filter): string {
  switch (filter.operator) {
    case "=":
      return `${filter.field} = "${filter.value}"`;
    case "!=":
      return `${filter.field} != "${filter.value}"`;
    case "~":
      return `lower(${filter.field}) ~ "${filter.value.toLowerCase()}"`;
    case ">":
      return `${filter.field} > "${filter.value}"`;
    case "<":
      return `${filter.field} < "${filter.value}"`;
    case ">=":
      return `${filter.field} >= "${filter.value}"`;
    case "<=":
      return `${filter.field} <= "${filter.value}"`;
    default:
      return "";
  }
}
```

---

## 2. Keyboard Navigation for Board View

### Overview

Implement comprehensive keyboard navigation for the Kanban board view, enabling power users to navigate, select, and edit tasks without using a mouse.

### Location

- **Frontend Component**: `src/components/task/board/board-view.tsx` (modify)
- **Custom Hook**: `src/hooks/use-board-keyboard.ts` (new)
- **Keyboard Shortcuts**: Update `src/constants/keyboard-shortcuts.ts` (new)

### Requirements

#### Navigation Keys

| Key           | Action      | Description                         |
| ------------- | ----------- | ----------------------------------- |
| `Arrow Left`  | Move left   | Navigate to previous column         |
| `Arrow Right` | Move right  | Navigate to next column             |
| `Arrow Up`    | Move up     | Navigate to previous card in column |
| `Arrow Down`  | Move down   | Navigate to next card in column     |
| `Home`        | Go to first | Navigate to first card in board     |
| `End`         | Go to last  | Navigate to last card in board      |
| `Page Up`     | Page up     | Scroll up in current column         |
| `Page Down`   | Page down   | Scroll down in current column       |

#### Action Keys

| Key            | Action              | Context               |
| -------------- | ------------------- | --------------------- |
| `Enter`        | Open task details   | On selected card      |
| `Space`        | Toggle selection    | On selected card      |
| `E`            | Edit task           | On selected card      |
| `M`            | Move to column      | Opens column picker   |
| `P`            | Set priority        | Opens priority picker |
| `A`            | Assign user         | Opens assignee picker |
| `Ctrl + Arrow` | Drag card           | While holding card    |
| `Escape`       | Close picker/cancel | Close any open modal  |

#### Modifier Keys

| Key                | Action                                      |
| ------------------ | ------------------------------------------- |
| `Shift + Arrow`    | Multi-select mode (select multiple cards)   |
| `Ctrl + Shift + N` | Create new task in current column's project |

### UI States

#### Focus Indicator

```
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │
│   │ ╔═════════════════════════╗ │   │
│   │ ║ ██ Selected Card ██     ║ │   │ ← Thick border + glow
│   │ ╚═════════════════════════╝ │   │
│   └─────────────────────────────┘   │
│                                     │
│   Column 1          Column 2        │
└─────────────────────────────────────┘
```

#### Picker Modal (opens on M, P, A keys)

```
┌─────────────────────┐
│ Move to column...   │
├─────────────────────┤
│ [ ] Todo            │
│ [✓] In Progress     │ ← Current column
│ [ ] Review          │
│ [ ] Done            │
└─────────────────────┘
      ↑ Arrow to navigate
    Enter to select
   Esc to cancel
```

### Implementation Steps

1. **Create useBoardKeyboard hook**
   - Track focused card position
   - Handle navigation key events
   - Manage picker modal state
   - Coordinate with dnd-kit for drag operations

2. **Update BoardCard component**
   - Add `tabIndex={0}` for keyboard focus
   - Add focus styles
   - Handle Enter key for details view

3. **Update BoardColumn component**
   - Manage column-level keyboard navigation
   - Handle wrap-around between columns

4. **Implement visual focus system**
   - Track: `focusedColumnId` | `focusedCardId` | `selectedCards[]`
   - Render focus indicators
   - Scroll focused card into view

### Hook Signature

```typescript
interface BoardKeyboardState {
  focusedColumnId: string | null;
  focusedCardId: string | null;
  selectedCardIds: string[];
  isPickerOpen: boolean;
  pickerType: "column" | "priority" | "assignee" | null;
  pickerTargetCardId: string | null;
}

interface BoardKeyboardActions {
  focusCard: (columnId: string, cardId: string) => void;
  focusColumn: (columnId: string) => void;
  moveFocus: (direction: "up" | "down" | "left" | "right") => void;
  selectCard: (cardId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  openPicker: (type: "column" | "priority" | "assignee") => void;
  closePicker: () => void;
  executeAction: (action: "edit" | "move" | "assign" | "priority") => void;
}

function useBoardKeyboard(
  columns: BoardColumn[],
  onCardAction?: (cardId: string, action: CardAction) => void,
): BoardKeyboardState & BoardKeyboardActions;
```

### Keyboard Event Handler

```typescript
function handleKeyDown(event: React.KeyboardEvent) {
  // Ignore if user is typing in an input
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  switch (event.key) {
    case "ArrowUp":
      event.preventDefault();
      moveFocus("up");
      break;
    case "ArrowDown":
      event.preventDefault();
      moveFocus("down");
      break;
    case "ArrowLeft":
      event.preventDefault();
      moveFocus("left");
      break;
    case "ArrowRight":
      event.preventDefault();
      moveFocus("right");
      break;
    case "Enter":
      event.preventDefault();
      openTaskDetails();
      break;
    case " ":
      event.preventDefault();
      selectCard(focusedCardId, event.shiftKey);
      break;
    case "m":
    case "M":
      event.preventDefault();
      openPicker("column");
      break;
    case "Escape":
      if (isPickerOpen) {
        event.preventDefault();
        closePicker();
      }
      break;
    // ... other handlers
  }
}
```

### Accessibility Considerations

1. **Screen Reader Support**
   - Announce focus changes: "Card X moved to column Y"
   - Announce selection: "X cards selected"
   - Provide context for picker options

2. **Focus Management**
   - Maintain logical focus order
   - Don't trap focus inappropriately
   - Restore focus after modal closes

3. **Visible Indicators**
   - High contrast focus ring
   - Announcement for mode changes (selection mode, picker open)

### Testing Scenarios

| Test                            | Expected Result                       |
| ------------------------------- | ------------------------------------- |
| Press Arrow Right from column 1 | Focus moves to first card in column 2 |
| Press Arrow Down on last card   | Focus wraps to first card in column   |
| Press M while card focused      | Column picker opens                   |
| Press Enter on selected card    | Task details modal opens              |
| Press Space on card             | Card is selected                      |
| Shift + Arrow Down              | Multiple cards selected               |
| Press Escape with picker open   | Picker closes, focus returns to card  |
