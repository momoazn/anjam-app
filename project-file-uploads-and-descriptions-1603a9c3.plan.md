<!-- 1603a9c3-4e43-4e90-a7a6-b9da15363c75 a8b74d43-17f5-42aa-9f33-f82fcc394458 -->

# Project File Uploads and Descriptions

## Overview

Enhance the projects collection with:

1. **Description field** - Rich text editor for project context, objectives, and specifications
2. **Assets field** - Multiple file uploads supporting PDFs, images, and documents
3. **Secure file management** - Access controls, validation, and optimized storage
4. **UI enhancements** - File upload interface, file display, and description editor in project forms

## Implementation Steps

### 1. Schema Updates (`pb_schema.json`)

Update the `projects` collection to add:

- **`description`** field (type: `editor`) - Rich text description for project details
- **`assets`** field (type: `file`) - Multiple files with:
- `maxSelect: 0` (unlimited files)
- `maxSize: 52428800` (50MB per file)
- `mimeTypes`: `["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/*"]`
- `protected: true` (require authentication for access)

### 2. Type Generation

Regenerate PocketBase types after schema update:

- Run `bun run gen:type` to update `src/lib/pocketbase-types.ts`
- Update `ProjectsRecord` type to include `description?: HTMLString` and `assets?: FileNameString[]`

### 3. Project Form Components

Update `src/components/forms/project-fields.tsx`:

- Add description field using Textarea or editor component (match task description pattern)
- Add file upload component for assets
- Include file validation on client-side (size, type)
- Show existing files with preview/delete options

### 4. File Upload Component (`src/components/ui/file-upload.tsx`)

Create new component:

- Drag-and-drop file upload area
- File list with previews (images), icons (documents)
- File size and type validation
- Remove file functionality
- Progress indicators for uploads
- Support multiple file selection

### 5. File Display Component (`src/components/project/project-assets.tsx`)

Create component to display project assets:

- Grid/list view of uploaded files
- Image thumbnails using PocketBase thumbnail API
- File icons for non-image files
- Download links with proper authentication
- File metadata (name, size, type)

### 6. Update Project Dialogs

**Create Project Dialog** (`src/components/project/create-project-dialog.tsx`):

- Add description field to form schema
- Add file upload component
- Handle FormData submission for file uploads
- Update mutation to support multipart/form-data

**Edit Project Dialog** (`src/components/project/edit-project-dialog.tsx`):

- Add description field (pre-populate with existing value)
- Add file upload for new assets
- Add file management (delete existing files)
- Handle file append/delete operations using PocketBase `+` and `-` suffixes

### 7. Project Display Updates

**Project Cards** (`src/components/project/project-list-group.tsx`):

- Optionally show description preview (truncated)
- Show asset count badge
- Link to detailed view if needed

**Project Details Page** (`src/pages/project-details.tsx`) - **REQUIRED**:

- Create dedicated project details page displaying:
- **Project title** and code
- **Supervisor** information (name, avatar)
- **Description** with full rich text rendering
- **Files section** with:
- File grid display
- Download buttons for each file
- File metadata (name, size, type)
- Image thumbnails where applicable
- **Other relevant info**:
- Creation date
- Last updated date
- Project statistics (task count, completion status)
- Related links (tasks, users)
- Add routing for `/projects/:id/details`
- Make project cards clickable to navigate to details page

### 8. File Access & Security

- Use PocketBase file token API for protected file access
- Implement `pb.files.getToken()` for authenticated file URLs
- Update file URLs in components to include tokens when needed
- Ensure permission rules in schema match file access requirements

### 9. Validation & Error Handling

- Client-side: File size limits, MIME type validation
- Server-side: PocketBase schema validation (already configured)
- Error messages for upload failures
- Loading states during file operations

### 10. Hooks & Utilities

Create `src/hooks/use-file-upload.ts`:

- Hook for handling file uploads
- File validation logic
- Progress tracking
- Error handling

### 11. Constants & Text

Update `src/constants/text.ts`:

- Add Persian text constants for file upload UI
- Error messages for file validation
- Labels for description and assets fields

### 12. Permission Verification

Ensure existing permission rules are sufficient:

- Current `updateRule` allows admin and project supervisors
- File access protected by PocketBase file protection
- No additional permission changes needed

## Files to Create/Modify

**Create:**

- `src/components/ui/file-upload.tsx` - File upload component
- `src/components/project/project-assets.tsx` - Asset display component
- `src/hooks/use-file-upload.ts` - File upload hook
- `src/pages/project-details.tsx` - Detailed project view (REQUIRED)

**Modify:**

- `pb_schema.json` - Add description and assets fields
- `src/components/forms/project-fields.tsx` - Add new fields
- `src/components/project/create-project-dialog.tsx` - Integrate new fields
- `src/components/project/edit-project-dialog.tsx` - Integrate new fields
- `src/components/project/project-list-group.tsx` - Optionally display description/assets
- `src/lib/pocketbase-types.ts` - Regenerate after schema update
- `src/constants/text.ts` - Add text constants

## Testing Checklist

- [ ] Create project with description and files
- [ ] Edit project description
- [ ] Upload multiple files to existing project
- [ ] Delete files from project
- [ ] Verify file type validation (reject invalid types)
- [ ] Verify file size validation (reject oversized files)
- [ ] Test file access permissions (admin, supervisor, employee)
- [ ] Test protected file URLs with tokens
- [ ] Verify image thumbnails work correctly
- [ ] Test file downloads
- [ ] Verify description renders correctly (rich text)

### To-dos

- [ ] Update pb_schema.json to add description (editor) and assets (file) fields to projects collection with 50MB max file size and proper validation rules
- [ ] Run bun run gen:type to regenerate PocketBase TypeScript types after schema update
- [ ] Create src/components/ui/file-upload.tsx component with drag-and-drop, validation (50MB limit), and file list display
- [ ] Create src/components/project/project-assets.tsx to display uploaded files with thumbnails, download buttons, and file metadata
- [ ] Create src/hooks/use-file-upload.ts hook for file validation (50MB limit), upload handling, and progress tracking
- [ ] Update src/components/forms/project-fields.tsx to include description (editor) and file upload fields
- [ ] Update create-project-dialog.tsx to handle FormData submission with files and description field
- [ ] Update edit-project-dialog.tsx to support description editing, file uploads, and file deletion using PocketBase + and - suffixes
- [ ] Create src/pages/project-details.tsx displaying project title, supervisor, description, files with download buttons, creation/update dates, and project statistics
- [ ] Add routing for project details page (/projects/:id/details) and update router.tsx
- [ ] Update project-list-group.tsx to make cards clickable and navigate to project details page
- [ ] Implement protected file URL generation using pb.files.getToken() for secure file access in project-assets and project-details components
- [ ] Add Persian text constants for file upload UI, validation messages, field labels, and project details page in src/constants/text.ts
- [ ] Test file upload (50MB limit), deletion, access permissions, validation, thumbnail generation, and downloads
- [ ] Test project details page displays all information correctly, file downloads work, and navigation from project list functions properly
