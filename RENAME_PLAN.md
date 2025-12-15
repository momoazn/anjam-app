# App Renaming Plan: Task Manager → Anjam (انجام)

## Overview

This document outlines the plan to rename the "Task Manager" application to "Anjam" (انجام) and update the domain to ianjam.ir.

## Goals

1. Rename the application from "Task Manager" to "Anjam" (انجام)
2. Update the production domain from localhost/127.0.0.1 to ianjam.ir (development remains on localhost/127.0.0.1)
3. Maintain all functionality while updating branding and references

## Files to Update

### 1. Frontend Files

- **src/lib/pocketbase.ts**: Update the base URL conditional to use "/" for production (since React app served by backend) while keeping "http://127.0.0.1:8090/" for development
- **index.html**: Update the page title from "Task Manager" to "Anjam"
- **src/constants/text.ts**: Update all text labels that reference "task management application" to "Anjam application"
- **src/components/ui/file-upload.tsx**: Update file preview URLs if needed
- **src/lib/pocketbase-types.ts**: Update any generated types that reference old app name
- **src/hooks/use-file-upload.ts**: Update file preview URLs if needed

### 2. Backend Files

- **main.go**: Update the package documentation comment from "task manager application" to "anjam application"
- **backend_constants.go**: Update any constants that reference the old app name

### 3. Configuration Files

- **package.json**: Update "name" field from "task-manager-app" to "anjam-app"
- **go.mod**: Update module name from "task-manager" to "anjam"
- **.air.toml**: Update configuration if it references "task-manager"
- **Dockerfile**: Update references to "task-manager" executable and user
- **docker-compose.yml**: Update service name from "task-manager" to "anjam"
- **vite.config.ts**: No domain change needed (proxy remains "http://localhost:8090" for development)
- **playwright.config.ts**: Update base URL for production testing (local tests continue to use localhost)

### 4. Documentation Files

- **README.md**: Update title and all references from "Task Manager" to "Anjam"
- **AGENTS.md**: Update references from "task and project management application" to "anjam application"
- **docs/FULL_THESIS_PROPOSAL.md**: Update references from "Enterprise Task Manager" to "Anjam"
- **docs/GROUP_ORGANIZATION_IMPLEMENTATION.md**: Update references from "Task Manager application"
- **docs/GROUP_TASK_03_FRONTEND_PERMISSIONS_AND_TEXT.md**: Update permission-related text if needed
- **docs/GROUP_TASK_07_QUALITY_AND_TESTING.md**: Update references if needed
- **CLEANUP_DELEGATION.md**: Update title from "Task Manager App" to "Anjam App"

### 5. Scripts and Launchers

- **run.sh**: Update comments and executable name from "task-manager" to "anjam"
- **run.bat**: Update comments and executable name from "task-manager" to "anjam"
- **run-with-env.bat**: Update comments and executable name from "task-manager" to "anjam"

### 6. Environment and Testing

- **bun.lock**: Will be automatically updated when package.json is changed
- **playwright.config.ts**: Update base URL for production testing (local tests continue to use localhost)
- **e2e/auth.spec.ts**: Update URL expectations if needed

### 7. Internal Constants and Storage Keys

- **src/hooks/use-saved-filters.ts**: Update storage keys from "task_manager_saved_filters" and "task_manager_default_filter" to "anjam_saved_filters" and "anjam_default_filter"

### 8. Permissions and Roles

- **src/lib/permissions.ts**: Update any comments or text related to "manager" role if it should be renamed (should be kept as a role type, not renamed)
- Check if "manager" in permission roles should be renamed to align with new app name

## Implementation Steps

### Phase 1: Preparation

1. Create a backup branch before starting the rename process
2. Update all documentation files first to maintain consistency
3. Update configuration files that are used by build tools

### Phase 2: Core Changes

1. Update package.json and go.mod files
2. Update frontend application files (index.html, text constants)
3. Update backend application files (main.go)
4. Update Docker-related files (Dockerfile, docker-compose.yml)

### Phase 3: Infrastructure & Environment

1. Update production configuration (vite.config.ts remains unchanged for development)
2. Update testing configuration for production URLs (playwright.config.ts)
3. Update launch scripts (run.sh, run.bat, run-with-env.bat)

### Phase 4: Testing

1. Build the frontend and backend to ensure no compilation errors
2. Run unit tests to verify functionality remains intact
3. Run E2E tests to verify the app works as expected
4. Verify all references to the new app name appear correctly in UI

### Phase 5: Domain Configuration

1. When deployed, ensure DNS records point to ianjam.ir
2. Configure SSL certificate for ianjam.ir
3. Update any hardcoded domain references in production builds
4. Verify that environment variables and build configurations properly differentiate between dev and production domains
5. Ensure the backend serves the React app correctly with proper API endpoint routing

## Important Considerations

### Backward Compatibility

- Consider if there are any API endpoints that external services might depend on
- If there are database entries that reference the old app name, plan for migration

### Database Schema

- The PocketBase schema (pb_schema.json) may contain references to "task" in collection names or fields
- Consider whether to rename collections like "tasks", "projects", etc., or keep them for compatibility
- Update any auto-generated TypeScript types after schema changes

### URL Structure

- Current URL structure uses paths like /tasks, /projects, etc.
- Consider if these paths should change to Persian equivalents or remain in English for technical consistency
- In production, API requests will be relative to the same domain (using "/" as base URL) since the React app is served by the backend
- In development, API requests will continue to go to the backend server at 127.0.0.1:8090

### Search and Replace Guidelines

- Pay special attention to case-sensitive replacements
- Avoid changing "tasks" to "anjam" in the API routes if they should remain as English technical terms
- Ensure that "taskmanager" and "task-manager" references are properly replaced
- Verify that replacing "Task Manager" doesn't affect the word "task" in other contexts where it's appropriate

## Post-Rename Verification

### Functional Testing

- Verify all application features work as expected
- Test user authentication and authorization
- Verify file uploads and downloads work correctly
- Ensure all forms and data submission work correctly

### Branding Verification

- Check that the app title appears correctly on all pages
- Verify that all UI text uses the correct terminology
- Ensure that any help documentation has been updated

### URL and Domain Verification

- Verify all internal links work correctly
- Ensure API calls are made to the correct domain
- Test file access URLs still work properly

## Rollback Plan

If issues arise, maintain the backup branch to quickly revert all changes and restore the original "Task Manager" application.
