# Excel Export Feature - Issues and Fixes

## Overview

This document outlines identified issues in the Excel export functionality and provides detailed solutions for each. The implementation is currently functional but has security, edge case handling, and UX improvement opportunities.

---

## 🔴 High Priority Issues

### 1. XSS Security Vulnerability in HTML Stripping

**Location**: `src/lib/excel-export.ts:12-18`

**Issue**:
The `stripHtml` function uses `innerHTML` directly without sanitization, which could execute malicious scripts if the database contains compromised HTML content.

```typescript
// Current vulnerable code
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html; // ⚠️ XSS vulnerability
  return tmp.textContent || tmp.innerText || "";
}
```

**Risk Level**: High
- Malicious HTML in task descriptions could execute scripts
- Could expose user data or perform unauthorized actions

**Solution 1: Use DOMParser (Recommended)**

```typescript
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Server-side fallback
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch {
    // Fallback to regex if parsing fails
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
```

**Why DOMParser is safer**:
- Parses HTML in a sandboxed context
- Doesn't execute scripts
- More explicit about intent

**Solution 2: Use a Sanitization Library**

```bash
bun add dompurify
bun add -D @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Sanitize and then extract text
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // Remove all tags
    KEEP_CONTENT: true // Keep text content
  });

  return clean.trim();
}
```

**Solution 3: Simple Regex (Quick Fix)**

```typescript
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
    .replace(/<[^>]+>/g, '')  // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace &nbsp;
    .replace(/&[a-z]+;/gi, '') // Remove HTML entities
    .trim();
}
```

**Recommendation**: Use **Solution 1 (DOMParser)** as it's built-in, secure, and doesn't require additional dependencies.

---

### 2. SSR/Non-Browser Environment Compatibility

**Location**: `src/lib/excel-export.ts:12-18`

**Issue**:
The function assumes `document` is always available, which fails in server-side rendering or Node.js environments.

```typescript
const tmp = document.createElement("div"); // ❌ Fails in SSR
```

**Solution**:

```typescript
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Check if we're in a browser environment
  if (typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    // Server-side fallback: regex-based stripping
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/gi, '')
      .trim();
  }

  // Browser environment: use DOMParser
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch {
    return html.replace(/<[^>]+>/g, '').trim();
  }
}
```

**Testing**:

```typescript
// Add to test file
describe('stripHtml', () => {
  it('should work in browser environment', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('should handle null and undefined', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });

  it('should remove script tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('should handle complex HTML', () => {
    const html = '<div><p>Line 1</p><br/><p>Line 2</p></div>';
    const result = stripHtml(html);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });
});
```

---

## 🟡 Medium Priority Issues

### 3. Missing Column Width Configuration

**Location**: `src/lib/excel-export.ts:109-110, 145-146`

**Issue**:
Excel columns default to narrow widths, making Persian text difficult to read.

**Before**:
```typescript
const projectSheet = XLSX.utils.json_to_sheet(projectData);
XLSX.utils.book_append_sheet(workbook, projectSheet, "جزئیات پروژه");

const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");
```

**After**:
```typescript
// Project Details Sheet
const projectSheet = XLSX.utils.json_to_sheet(projectData);

// Set column widths (width in characters)
projectSheet['!cols'] = [
  { wch: 25 }, // نام
  { wch: 15 }, // کد
  { wch: 50 }, // توضیحات
  { wch: 20 }, // سرپرست
  { wch: 15 }, // تاریخ ایجاد
  { wch: 15 }, // آخرین به‌روزرسانی
];

XLSX.utils.book_append_sheet(workbook, projectSheet, "جزئیات پروژه");

// Tasks Sheet
const tasksSheet = XLSX.utils.json_to_sheet(tasksData);

// Set column widths
tasksSheet['!cols'] = [
  { wch: 10 }, // شماره
  { wch: 30 }, // عنوان
  { wch: 15 }, // وضعیت
  { wch: 12 }, // اولویت
  { wch: 20 }, // مسئول
  { wch: 15 }, // مهلت
  { wch: 15 }, // تاریخ ایجاد
  { wch: 15 }, // آخرین به‌روزرسانی
  { wch: 18 }, // زمان صرف شده (دقیقه)
  { wch: 60 }, // توضیحات
];

XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");
```

**Additional Formatting Options**:

```typescript
// Add auto-filter to tasks sheet
if (tasksData.length > 0) {
  tasksSheet['!autofilter'] = { ref: `A1:J${tasksData.length + 1}` };
}

// Freeze header row
tasksSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

// Set row height for header
if (!tasksSheet['!rows']) tasksSheet['!rows'] = [];
tasksSheet['!rows'][0] = { hpt: 20 }; // Header height in points
```

**Complete Enhanced Function**:

```typescript
// Add this helper function
function configureSheetFormatting(
  sheet: XLSX.WorkSheet,
  columnWidths: number[],
  hasAutoFilter: boolean = true,
  freezeHeader: boolean = true,
) {
  // Set column widths
  sheet['!cols'] = columnWidths.map(wch => ({ wch }));

  // Add auto-filter
  if (hasAutoFilter) {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    sheet['!autofilter'] = {
      ref: XLSX.utils.encode_range(range)
    };
  }

  // Freeze header row
  if (freezeHeader) {
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  // Set header row height
  if (!sheet['!rows']) sheet['!rows'] = [];
  sheet['!rows'][0] = { hpt: 20 };
}

// Usage in exportProjectToExcel:
const projectSheet = XLSX.utils.json_to_sheet(projectData);
configureSheetFormatting(projectSheet, [25, 15, 50, 20, 15, 15], false);
XLSX.utils.book_append_sheet(workbook, projectSheet, "جزئیات پروژه");

const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
configureSheetFormatting(tasksSheet, [10, 30, 15, 12, 20, 15, 15, 15, 18, 60]);
XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");
```

---

### 4. Filename Collision and Uniqueness

**Location**: `src/lib/excel-export.ts:148-153`

**Issue**:
Current filename generation may create duplicates or be non-unique:

```typescript
const projectName = (project.name || "project")
  .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
  .substring(0, 50);
const currentDate = format(new Date(), "yyyy-MM-dd");
const filename = `${projectName}-${currentDate}.xlsx`;
```

**Problems**:
- Multiple exports on same day = same filename
- Similar project names may collide after sanitization
- Browser download may auto-rename (filename.xlsx, filename(1).xlsx, etc.)

**Solution 1: Add Project Code or ID**

```typescript
// Generate filename with project code for uniqueness
const projectIdentifier = project.code || project.id.substring(0, 8);
const projectName = (project.name || "project")
  .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
  .substring(0, 40);
const currentDate = format(new Date(), "yyyy-MM-dd");
const timestamp = format(new Date(), "HHmmss");
const filename = `${projectIdentifier}_${projectName}_${currentDate}_${timestamp}.xlsx`;
```

**Solution 2: Add Timestamp**

```typescript
const projectName = (project.name || "project")
  .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
  .substring(0, 40);
const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
const filename = `export_${projectName}_${timestamp}.xlsx`;
```

**Solution 3: UUID-based (Most Unique)**

```typescript
import { nanoid } from 'nanoid';

const projectName = (project.name || "project")
  .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
  .substring(0, 40);
const currentDate = format(new Date(), "yyyy-MM-dd");
const uniqueId = nanoid(8); // Short unique ID
const filename = `${projectName}_${currentDate}_${uniqueId}.xlsx`;
```

**Recommendation**: Use **Solution 1** (with project code) as it's descriptive and unique without external dependencies.

---

### 5. Large Dataset Performance

**Location**: `src/lib/excel-export.ts:83-156`

**Issue**:
Synchronous processing of large datasets (1000+ tasks) can freeze the browser UI.

**Current Code**:
```typescript
export async function exportProjectToExcel(...) {
  // All processing happens synchronously
  const projectTasks = tasks.filter(...);
  const tasksData = projectTasks.map(...);
  // ...
  XLSX.writeFile(workbook, filename); // Blocks UI
}
```

**Solution 1: Add Loading Indicator (Quick Fix)**

Already implemented in `ProjectExportButton` component ✅

**Solution 2: Add Task Count Warning**

```typescript
// Add to exportProjectToExcel function
export async function exportProjectToExcel(
  project: ProjectsResponse<{ supervisor?: UsersResponse }>,
  tasks: TaskWithProject[],
  users: UsersResponse[],
  options?: { maxTasks?: number; onProgress?: (percent: number) => void }
): Promise<void> {
  const projectTasks = tasks.filter((task) => task.project === project.id);

  // Warn about large exports
  const maxTasks = options?.maxTasks || 10000;
  if (projectTasks.length > maxTasks) {
    throw new Error(
      `این پروژه ${projectTasks.length} تسک دارد. حداکثر ${maxTasks} تسک قابل صادرات است.`
    );
  }

  // ... rest of the function
}
```

**Solution 3: Web Worker for Large Exports**

Create `src/workers/excel-export.worker.ts`:

```typescript
import * as XLSX from "xlsx";

self.addEventListener('message', (e) => {
  const { projectData, tasksData } = e.data;

  try {
    const workbook = XLSX.utils.book_new();

    const projectSheet = XLSX.utils.json_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, "جزئیات پروژه");

    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");

    // Generate binary string
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'binary'
    });

    // Convert to ArrayBuffer
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    self.postMessage({ success: true, data: buf }, [buf]);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

Update `exportProjectToExcel`:

```typescript
export async function exportProjectToExcel(
  project: ProjectsResponse<{ supervisor?: UsersResponse }>,
  tasks: TaskWithProject[],
  users: UsersResponse[],
): Promise<void> {
  const projectTasks = tasks.filter((task) => task.project === project.id);

  // Use worker for large datasets
  if (projectTasks.length > 500) {
    return exportProjectToExcelWithWorker(project, projectTasks, users);
  }

  // ... existing synchronous code for small datasets
}

async function exportProjectToExcelWithWorker(
  project: ProjectsResponse<{ supervisor?: UsersResponse }>,
  projectTasks: TaskWithProject[],
  users: UsersResponse[],
): Promise<void> {
  // Prepare data
  const projectData = [/* ... */];
  const tasksData = projectTasks.map(/* ... */);

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/excel-export.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.postMessage({ projectData, tasksData });

    worker.onmessage = (e) => {
      if (e.data.success) {
        // Download the file
        const blob = new Blob([e.data.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFilename(project);
        a.click();
        URL.revokeObjectURL(url);

        worker.terminate();
        resolve();
      } else {
        worker.terminate();
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
  });
}
```

**Recommendation**: Start with **Solution 2** (task limit warning). Implement **Solution 3** (Web Worker) only if users report performance issues.

---

## 🟢 Low Priority Issues

### 6. Empty State Handling

**Location**: `src/lib/excel-export.ts:129-143`

**Current Behavior**:
```typescript
if (tasksData.length === 0) {
  tasksData.push({
    "شماره": "-",
    "عنوان": "این پروژه تسکی ندارد",
    // ... all fields with "-" or 0
  });
}
```

**Question**: Should we add this placeholder row, or leave the sheet empty?

**Option 1: Keep Current (Shows explicit message)**
- ✅ User immediately sees "no tasks" message
- ❌ Pollutes data if user imports to another system

**Option 2: Empty Sheet with Note**
```typescript
if (tasksData.length === 0) {
  // Add a note instead of a data row
  tasksSheet['!margins'] = { top: 0.75, bottom: 0.75, left: 0.7, right: 0.7, header: 0.3, footer: 0.3 };
  // Note: xlsx doesn't support comments in JSON-to-sheet, but we can add an extra sheet
}
```

**Option 3: Add Separate Info Sheet**
```typescript
if (tasksData.length === 0) {
  // Create info sheet
  const infoSheet = XLSX.utils.json_to_sheet([
    { "اطلاعیه": "این پروژه هیچ تسکی ندارد" }
  ]);
  XLSX.utils.book_append_sheet(workbook, infoSheet, "اطلاعیه");
}
```

**Recommendation**: Keep current behavior (**Option 1**) as it's the most user-friendly for Excel users.

---

### 7. Data Validation and Error Handling

**Location**: `src/components/reports/project-export-button.tsx:30-43`

**Current Error Handling**:
```typescript
try {
  await exportProjectToExcel(project, tasks, users);
  toast.success(fa.reports.exportProjectSuccess);
} catch (error) {
  console.error("Error exporting project:", error);
  toast.error(fa.reports.exportProjectError);
}
```

**Improvements**:

```typescript
try {
  // Validate data before export
  if (!project) {
    throw new Error("پروژه یافت نشد");
  }

  if (!tasks || tasks.length === 0) {
    // Optional: warn user about empty export
    const confirmed = window.confirm(
      "این پروژه هیچ تسکی ندارد. آیا می‌خواهید فایل خالی صادر کنید?"
    );
    if (!confirmed) return;
  }

  await exportProjectToExcel(project, tasks, users);

  toast.success(
    `صادرات ${taskCount} تسک با موفقیت انجام شد`,
    { duration: 3000 }
  );
} catch (error) {
  console.error("Error exporting project:", error);

  const errorMessage = error instanceof Error
    ? error.message
    : fa.reports.exportProjectError;

  toast.error(errorMessage, { duration: 5000 });
}
```

**Add to `src/constants/text.ts`**:
```typescript
exportProjectNoTasks: "این پروژه تسکی ندارد. آیا می‌خواهید فایل خالی صادر کنید؟",
exportProjectSuccessWithCount: "صادرات {count} تسک با موفقیت انجام شد",
```

---

### 8. Excel Metadata and Properties

**Location**: `src/lib/excel-export.ts:92`

**Enhancement**: Add workbook metadata

```typescript
const workbook = XLSX.utils.book_new();

// Add workbook properties
workbook.Props = {
  Title: `گزارش پروژه - ${project.name}`,
  Subject: `تسک‌های پروژه ${project.code || ''}`,
  Author: "سیستم مدیریت تسک",
  CreatedDate: new Date(),
  Company: "Your Company Name",
  Comments: `صادر شده در تاریخ ${format(new Date(), "yyyy/MM/dd HH:mm")}`,
};

// Set workbook views (RTL support)
workbook.Workbook = {
  Views: [{
    RTL: true // Right-to-left for Persian
  }]
};
```

---

## 🧪 Testing Strategy

### Unit Tests

Create `src/lib/excel-export.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { ProjectsResponse, UsersResponse } from './pocketbase-types';
import type { TaskWithProject } from './pocketbase';

// You'll need to refactor to export these helper functions
describe('Excel Export Utils', () => {
  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      expect(stripHtml(html)).toBe('Hello World');
    });

    it('should handle null and undefined', () => {
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
    });

    it('should handle XSS attempts', () => {
      const html = '<script>alert("xss")</script>Safe Text';
      const result = stripHtml(html);
      expect(result).not.toContain('script');
      expect(result).toContain('Safe Text');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates', () => {
      const date = '2025-01-15T10:30:00Z';
      expect(formatDate(date)).toMatch(/\d{4}\/\d{2}\/\d{2}/);
    });

    it('should handle null dates', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('-');
    });
  });

  describe('getUserName', () => {
    it('should combine first and last name', () => {
      const user = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe'
      } as UsersResponse;
      expect(getUserName(user)).toBe('John Doe');
    });

    it('should fallback to username', () => {
      const user = {
        first_name: '',
        last_name: '',
        username: 'johndoe'
      } as UsersResponse;
      expect(getUserName(user)).toBe('johndoe');
    });

    it('should handle undefined user', () => {
      expect(getUserName(undefined)).toBe('-');
      expect(getUserName(undefined, 'N/A')).toBe('N/A');
    });
  });
});
```

### Integration Tests

Create `src/lib/excel-export.integration.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { exportProjectToExcel } from './excel-export';

// Mock XLSX.writeFile
vi.mock('xlsx', async () => {
  const actual = await vi.importActual('xlsx');
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

describe('exportProjectToExcel', () => {
  it('should create workbook with two sheets', async () => {
    const project = {
      id: 'proj1',
      name: 'Test Project',
      code: 'TP-001',
      created: '2025-01-01T00:00:00Z',
      updated: '2025-01-10T00:00:00Z',
    };

    const tasks = [
      {
        id: 'task1',
        project: 'proj1',
        title: 'Test Task',
        status: 'done',
        priority: 'high',
        created: '2025-01-01T00:00:00Z',
        updated: '2025-01-05T00:00:00Z',
      },
    ];

    const users = [];

    await exportProjectToExcel(project, tasks, users);

    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining('.xlsx')
    );
  });

  it('should handle empty tasks', async () => {
    const project = { /* ... */ };
    const tasks = [];
    const users = [];

    await expect(
      exportProjectToExcel(project, tasks, users)
    ).resolves.not.toThrow();
  });
});
```

### Manual Testing Checklist

```markdown
## Manual Testing Checklist

### Basic Functionality
- [ ] Export project with 0 tasks
- [ ] Export project with 1 task
- [ ] Export project with 100+ tasks
- [ ] Export project with 1000+ tasks (performance test)

### Data Integrity
- [ ] All project fields populated correctly
- [ ] All task fields populated correctly
- [ ] HTML stripped from descriptions
- [ ] Dates formatted in Persian calendar
- [ ] Status labels in Persian
- [ ] Priority labels in Persian

### Special Characters
- [ ] Project name with Persian characters
- [ ] Project name with spaces and special chars
- [ ] Task titles with emojis
- [ ] HTML entities in descriptions (&nbsp;, &lt;, etc.)

### Edge Cases
- [ ] Missing supervisor
- [ ] Tasks without assignee
- [ ] Tasks without deadline
- [ ] Tasks without description
- [ ] Very long task titles (>200 chars)
- [ ] Very long descriptions (>5000 chars)

### File Output
- [ ] File downloads successfully
- [ ] Filename is valid and descriptive
- [ ] No filename collisions on multiple exports
- [ ] File opens in Microsoft Excel
- [ ] File opens in Google Sheets
- [ ] File opens in LibreOffice Calc
- [ ] Persian text displays correctly (RTL)
- [ ] Column widths are readable
- [ ] Dates are formatted correctly

### UI/UX
- [ ] Loading state shows during export
- [ ] Success toast appears
- [ ] Error toast appears on failure
- [ ] Button disables during export
- [ ] Task count displays correctly
```

---

## 📋 Implementation Priority

### Phase 1: Security & Critical Fixes (Do Immediately)
1. ✅ Fix XSS vulnerability in `stripHtml` (DOMParser solution)
2. ✅ Add SSR compatibility check
3. ✅ Add basic error handling improvements

### Phase 2: UX Improvements (Next Sprint)
1. ✅ Add column width configuration
2. ✅ Improve filename uniqueness
3. ✅ Add workbook metadata
4. ✅ Add RTL support for workbook

### Phase 3: Performance & Scale (As Needed)
1. ⏳ Add task count warning (if users report issues)
2. ⏳ Implement Web Worker (if >1000 tasks common)
3. ⏳ Add progress indicator

### Phase 4: Testing & Documentation (Ongoing)
1. ⏳ Add unit tests
2. ⏳ Add integration tests
3. ⏳ Complete manual testing checklist
4. ⏳ Add JSDoc documentation

---

## 🔧 Quick Wins (30 minutes or less)

If you only have time for quick improvements, do these:

1. **Fix stripHtml security** (10 min)
   - Replace `innerHTML` with `DOMParser`

2. **Add column widths** (5 min)
   - Add `sheet['!cols']` configuration

3. **Improve filename** (5 min)
   - Add project code and timestamp

4. **Add better error messages** (10 min)
   - Show specific error messages in toast

---

## 📚 Additional Resources

- [SheetJS Documentation](https://docs.sheetjs.com/)
- [DOMParser MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

---

## 🎯 Success Criteria

After implementing these fixes:

- ✅ No security vulnerabilities in HTML handling
- ✅ Works in all environments (browser, SSR)
- ✅ Excel files are readable with proper formatting
- ✅ No filename collisions
- ✅ Performance acceptable for up to 1000 tasks
- ✅ Comprehensive test coverage (>80%)
- ✅ Clear error messages for users

---

**Last Updated**: 2025-11-10
**Version**: 1.0
**Author**: Claude Code Review
