# Task Attachments Implementation Spec

## Status: Requires Schema Changes (Manual Implementation Required)

This document outlines the implementation plan for **Task 8: Add task attachments (file uploads on tasks)**.

## Database Schema Changes Required

### Tasks Collection Update

Add the following field to the `tasks` collection in PocketBase:

#### Attachments File Field

```json
{
  "name": "attachments",
  "type": "file",
  "maxSelect": 99,
  "maxSize": 52428800,
  "mimeTypes": [
    "application/pdf",
    "image/*",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/*",
    "text/csv",
    "application/csv",
    "text/plain",
    "application/json",
    "application/xml",
    "text/xml"
  ],
  "thumbs": ["100x100"],
  "protected": true,
  "required": false
}
```

**Field Configuration:**
- **maxSelect**: 99 (up to 99 attachments per task)
- **maxSize**: 52428800 bytes (50 MB per file)
- **mimeTypes**: Same as projects.assets field (PDF, images, Office documents, text files)
- **thumbs**: Generate 100x100 thumbnails for images
- **protected**: true (files can only be accessed with proper authentication)

## TypeScript Types Update

After schema changes, regenerate types:

```bash
bun run gen:type
```

Expected type additions:

```typescript
interface TasksRecord {
  // ... existing fields ...
  attachments?: FileNameString[];
}

interface TasksResponse<Texpand = unknown> {
  // ... existing fields ...
  attachments: string[]; // File names
}
```

## File Upload Component (Already Exists)

The app already has a `FileUpload` component at `src/components/ui/file-upload.tsx` used for projects. This can be reused for tasks.

**Features:**
- Drag-and-drop upload
- File type validation
- Size validation
- Multiple file selection
- Upload progress indication
- File preview for images

## UI Components to Create/Update

### 1. TaskAttachments Component

**Location**: `src/components/task/task-attachments.tsx`

**Features**:
- Display list of attached files
- File type icons
- File size display
- Download button
- Delete button (with confirmation)
- Image preview/thumbnail
- Upload new files button
- Empty state when no attachments

**Props**:

```typescript
interface TaskAttachmentsProps {
  taskId: string;
  attachments: string[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (filename: string) => Promise<void>;
}
```

### 2. AttachmentItem Component

**Location**: `src/components/task/attachment-item.tsx`

**Features**:
- File icon based on type
- File name with truncation
- File size display
- Download link
- Delete button
- Image thumbnail preview
- Last modified date (if available)

**Props**:

```typescript
interface AttachmentItemProps {
  taskId: string;
  filename: string;
  collectionId: string;
  recordId: string;
  onDelete: (filename: string) => void;
}
```

### 3. AttachmentPreviewDialog Component

**Location**: `src/components/task/attachment-preview-dialog.tsx`

**Features**:
- Image preview in dialog
- PDF preview (iframe)
- Download button in dialog
- Close button
- Next/previous navigation for multiple images

## Utility Functions

**`src/lib/file-utils.ts`** (enhance existing or create new):

```typescript
/**
 * Get file type icon based on mime type or extension
 */
export function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <Image className="h-4 w-4" />;
    case 'doc':
    case 'docx':
      return <FileType className="h-4 w-4" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <Sheet className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get PocketBase file URL
 */
export function getFileUrl(
  collectionId: string,
  recordId: string,
  filename: string,
  thumb?: string,
): string {
  const baseUrl = pb.baseUrl;
  if (thumb) {
    return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}?thumb=${thumb}`;
  }
  return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}
```

## Hooks Updates

**`src/hooks/tasks.ts`** additions:

```typescript
/**
 * Upload attachments to a task
 */
export function useUploadTaskAttachments(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const task = await pb.collection("tasks").getOne(taskId);
      const formData = new FormData();

      // Append existing attachments
      task.attachments?.forEach((filename: string) => {
        formData.append('attachments', filename);
      });

      // Append new files
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      return await pb.collection("tasks").update<TasksResponse>(taskId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}

/**
 * Delete a task attachment
 */
export function useDeleteTaskAttachment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const task = await pb.collection("tasks").getOne(taskId);
      const updatedAttachments = task.attachments?.filter(
        (f: string) => f !== filename
      ) || [];

      const formData = new FormData();
      updatedAttachments.forEach((f: string) => {
        formData.append('attachments', f);
      });

      return await pb.collection("tasks").update<TasksResponse>(taskId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}
```

## Text Constants

Add to `src/constants/text.ts`:

```typescript
attachments: {
  title: "فایل‌های پیوست",
  add: "افزودن فایل",
  upload: "آپلود فایل",
  noAttachments: "فایل پیوستی وجود ندارد",
  noAttachmentsDescription: "فایل‌های خود را اینجا بکشید یا کلیک کنید",
  download: "دانلود",
  delete: "حذف",
  preview: "پیش‌نمایش",
  uploadSuccess: "فایل با موفقیت آپلود شد",
  uploadError: "خطا در آپلود فایل",
  deleteSuccess: "فایل با موفقیت حذف شد",
  deleteError: "خطا در حذف فایل",
  deleteConfirm: {
    title: "حذف فایل؟",
    description: "آیا مطمئن هستید که می‌خواهید این فایل را حذف کنید؟",
    cancel: "انصراف",
    confirm: "حذف",
  },
  maxSize: "حداکثر حجم: {size}",
  count: "{count} فایل",
  dragDrop: "فایل‌ها را اینجا بکشید",
  or: "یا",
  browse: "انتخاب فایل",
  supportedFormats: "فرمت‌های پشتیبانی شده",
}
```

## Integration Points

### Task Detail Page

Update `src/pages/task-details.tsx`:

1. Import TaskAttachments component
2. Add attachments section after description:

```tsx
{/* Attachments Section */}
{task.attachments && task.attachments.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Paperclip className="h-5 w-5" />
        {text.attachments.title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <TaskAttachments
        taskId={task.id}
        attachments={task.attachments}
        onUpload={handleUploadAttachments}
        onDelete={handleDeleteAttachment}
      />
    </CardContent>
  </Card>
)}
```

### Task Forms

Update task creation/edit forms to include file upload:

- Add FileUpload component to forms
- Handle file selection and upload
- Display uploaded files with remove option

### Task List Views

Show attachment indicator icon on task cards:

```tsx
{task.attachments && task.attachments.length > 0 && (
  <Badge variant="outline" className="gap-1">
    <Paperclip className="h-3 w-3" />
    {task.attachments.length}
  </Badge>
)}
```

## Testing Requirements

### Unit Tests

- `file-utils.test.ts`: Test file utility functions
- Test file type detection
- Test file size formatting
- Test URL generation

### Integration Tests

- Upload attachment to task
- Download attachment
- Delete attachment
- Multiple file upload
- File size validation
- File type validation

### E2E Tests

- Create task with attachments
- View attachments on task detail page
- Download attachment file
- Delete attachment
- Upload additional attachments to existing task

## Implementation Steps

1. **Schema Changes** (Manual in PocketBase Admin):
   - Add `attachments` file field to tasks collection
   - Configure maxSelect, maxSize, mimeTypes as specified

2. **Type Generation**:
   ```bash
   bun run gen:type
   ```

3. **Utility Functions**:
   - Create or enhance `file-utils.ts` with helper functions

4. **Hooks**:
   - Add useUploadTaskAttachments hook
   - Add useDeleteTaskAttachment hook

5. **UI Components**:
   - Create TaskAttachments component
   - Create AttachmentItem component
   - Create AttachmentPreviewDialog component

6. **Integration**:
   - Update task detail page
   - Update task forms (create/edit)
   - Update task list items (show attachment count)

7. **Text Constants**:
   - Add all attachment-related text

8. **Testing**:
   - Write unit tests
   - Write integration tests
   - Write E2E tests

9. **Documentation**:
   - Update user documentation
   - Add examples and screenshots

## Estimated Effort

- Schema changes: 30 minutes
- Utility functions: 1-2 hours
- Hooks: 1-2 hours
- UI components: 4-6 hours
- Integration: 2-3 hours
- Testing: 2-3 hours
- **Total**: 10-16 hours

## Related Tasks

- Task 9: Implement task history/audit log (track attachment changes)
- Projects already have file attachments (can reuse components/patterns)

## Notes

- File attachments use the same pattern as project assets
- PocketBase handles file storage and serving automatically
- Files are protected and require authentication to access
- Thumbnails are generated automatically for images
- Consider adding file upload progress indication for large files
- Consider adding bulk download (zip) for multiple attachments

---

**Status**: Awaiting manual schema implementation in PocketBase Admin UI
**Priority**: High (Phase 2 feature)
**Complexity**: Medium (schema changes required, but patterns exist)
