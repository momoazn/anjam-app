# App Renaming Plan: Task Manager → Anjam (انجام)

## Overview

This document outlines the plan to rename the "Task Manager" application to "Anjam" (انجام) and update the domain to ianjam.ir.

## Goals

1. Rename the application from "Task Manager" to "Anjam" (انجام)
2. Update the production domain from localhost/127.0.0.1 to ianjam.ir (development remains on localhost/127.0.0.1)
3. Maintain all functionality while updating branding and references
4. Update all build artifacts and release binaries to use new naming

## Files to Update

### 1. Frontend Files

- **[`index.html`](index.html:7)**: Update page title from "Task Manager" to "Anjam"
- **[`src/lib/pocketbase.ts`](src/lib/pocketbase.ts:16)**: Update base URL conditional (already uses "/" for production, "http://127.0.0.1:8090/" for development)
- **[`src/hooks/use-saved-filters.ts`](src/hooks/use-saved-filters.ts:20-21)**: Update storage keys from "task_manager_saved_filters" and "task_manager_default_filter" to "anjam_saved_filters" and "anjam_default_filter"

### 2. Backend Files

- **[`backend/main.go`](backend/main.go:1)**: Update package documentation comment from "task manager application" to "anjam application"
- **[`backend/go.mod`](backend/go.mod:1)**: Update module name from "task-manager" to "anjam"

### 3. Configuration Files

- **[`package.json`](package.json:2)**: Update "name" field from "task-manager-app" to "anjam-app"
- **[`infra/Dockerfile`](infra/Dockerfile:51,67)**: Update references to "task-manager" executable
- **[`infra/docker-compose.yml`](infra/docker-compose.yml:4,21)**: Update service name and healthcheck references
- **[`vite.config.ts`](vite.config.ts)**: No changes needed (proxy remains "http://localhost:8090" for development)
- **[`playwright.config.ts`](playwright.config.ts)**: Update base URL for production testing if needed

### 4. Build and Release Scripts

- **[`scripts/build.ts`](scripts/build.ts:47,57,67)**: Update binary output names:
  - Linux: "task-manager" → "anjam"
  - Windows: "task-manager.exe" → "anjam.exe"
  - macOS: "task-manager-macos" → "anjam-macos"
- **[`scripts/build.ts`](scripts/build.ts:140)**: Update ZIP package name from "task-manager-windows.zip" to "anjam-windows.zip"
- **[`scripts/start.ts`](scripts/start.ts:11,13,15)**: Update binary path references
- **[`scripts/dev/run.sh`](scripts/dev/run.sh:4,32,42,56)**: Update comments and executable references
- **[`scripts/dev/run.bat`](scripts/dev/run.bat:3,26,49,63)**: Update comments and executable references
- **[`scripts/dev/run-with-env.bat`](scripts/dev/run-with-env.bat:3,17,25,37)**: Update comments and executable references

### 5. Documentation Files

- **[`README.md`](README.md:1)**: Update title and all references from "Task Manager" to "Anjam"
- **[`AGENTS.md`](AGENTS.md)**: Update references from "task and project management application" to "anjam application"
- **[`docs/FULL_THESIS_PROPOSAL.md`](docs/FULL_THESIS_PROPOSAL.md:49)**: Update references from "Enterprise Task Manager" to "Anjam"
- **[`docs/Audit_Logging_Plan.md](docs/Audit_Logging_Plan.md:3)**: Update references
- **[`docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md:111-113)**: Update release artifact references
- **[`docs/GitHub_Integration_Plan.md](docs/GitHub_Integration_Plan.md:3)**: Update references
- **[`CLEANUP_PLAN.md](CLEANUP_PLAN.md:5)**: Update title and references
- **[`CODEBASE_ISSUES.md](CODEBASE_ISSUES.md:5)**: Update references

### 6. Environment and Testing

- **[`bun.lock`](bun.lock:6)**: Will be automatically updated when package.json is changed
- **[`e2e/auth.spec.ts](e2e/auth.spec.ts)**: Update URL expectations if needed
- **[`.gitignore](.gitignore:36-37)**: Update ignored binary names

### 7. Build Artifacts and Release

- **[`.dockerignore](.dockerignore:17)**: Update ignored binary name
- **Release directory structure**: Update all references in documentation

## Implementation Steps

### Phase 1: Preparation

1. Create a backup branch: `git checkout -b rename/anjam-backup`
2. Update all documentation files first to maintain consistency
3. Create a feature branch: `git checkout -b rename/anjam`

### Phase 2: Core Application Changes

1. **[`package.json](package.json:2)**: Update name field
2. **[`index.html](index.html:7)**: Update page title
3. **[`src/hooks/use-saved-filters.ts](src/hooks/use-saved-filters.ts:20-21)**: Update storage keys
4. **[`backend/go.mod](backend/go.mod:1)**: Update module name
5. **[`backend/main.go](backend/main.go:1)**: Update package documentation

### Phase 3: Build System Updates

1. **[`scripts/build.ts](scripts/build.ts)**: Update binary output names and ZIP package name
2. **[`scripts/start.ts](scripts/start.ts)**: Update binary path references
3. **[`scripts/dev/run.sh](scripts/dev/run.sh)**: Update script comments and references
4. **[`scripts/dev/run.bat](scripts/dev/run.bat)**: Update script comments and references
5. **[`scripts/dev/run-with-env.bat](scripts/dev/run-with-env.bat)**: Update script comments and references

### Phase 4: Infrastructure Updates

1. **[`infra/Dockerfile](infra/Dockerfile)**: Update binary references
2. **[`infra/docker-compose.yml](infra/docker-compose.yml)**: Update service name and healthcheck
3. **[`.gitignore](.gitignore)**: Update ignored binary names
4. **[`.dockerignore](.dockerignore)**: Update ignored binary name

### Phase 5: Documentation Updates

1. **[`README.md](README.md)**: Update title and all references
2. **[`AGENTS.md](AGENTS.md)**: Update application references
3. **[`docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**: Update release artifact references
4. **[`docs/FULL_THESIS_PROPOSAL.md](docs/FULL_THESIS_PROPOSAL.md)**: Update references
5. **[`docs/Audit_Logging_Plan.md](docs/Audit_Logging_Plan.md)**: Update references
6. **[`docs/GitHub_Integration_Plan.md](docs/GitHub_Integration_Plan.md)**: Update references
7. **[`CLEANUP_PLAN.md](CLEANUP_PLAN.md)**: Update title and references
8. **[`CODEBASE_ISSUES.md](CODEBASE_ISSUES.md)**: Update references

### Phase 6: Testing and Verification

1. Run `bun install` to update lock file
2. Run `bun run build` to verify build succeeds with new names
3. Run `bun run check` to verify all quality checks pass
4. Run `bun run test:run` to verify unit tests pass
5. Run `bun run test:e2e` to verify E2E tests pass
6. Verify all UI text displays correctly
7. Test binary execution with new names

### Phase 7: Domain Configuration (Production)

1. Configure DNS records for ianjam.ir
2. Set up SSL certificate for ianjam.ir
3. Update production environment variables if needed
4. Verify backend serves React app correctly on production domain
5. Test all API endpoints work correctly on ianjam.ir

## Important Considerations

### Backward Compatibility

- API endpoints remain unchanged (e.g., `/api/tasks`, `/api/projects`) for technical consistency
- Database collection names remain unchanged for compatibility
- Role names (admin, manager, supervisor, employee) remain unchanged as they are role types, not app-specific branding

### Database Schema

- Keep collection names (`tasks`, `projects`, `users`, etc.) unchanged for API compatibility
- No database migration needed for renaming
- Auto-generated TypeScript types in [`src/lib/pocketbase-types.ts](src/lib/pocketbase-types.ts) remain valid

### URL Structure

- Frontend routes remain unchanged (`/tasks`, `/projects`, etc.)
- API routes remain unchanged for consistency
- In production, API requests use relative URLs (base URL: "/") since React app is served by backend
- In development, API requests continue to use `http://127.0.0.1:8090/`

### Search and Replace Guidelines

- **Case-sensitive replacements**: "Task Manager" → "Anjam", "task-manager" → "anjam", "task_manager" → "anjam"
- **Avoid over-replacement**: Don't change "tasks" to "anjam" in API routes or code contexts
- **Binary names**: Replace "task-manager" with "anjam" in build outputs and scripts
- **Package names**: Replace "task-manager-app" with "anjam-app" in package.json

### Environment Variables

- `TM_ALLOW_DEFAULT_ACCOUNTS` → `ANJAM_ALLOW_DEFAULT_ACCOUNTS` (consider updating for consistency)
- Update any documentation referencing old environment variable names

## Post-Rename Verification

### Functional Testing

- [ ] All application features work as expected
- [ ] User authentication and authorization function correctly
- [ ] File uploads and downloads work properly
- [ ] All forms and data submission work correctly
- [ ] Search functionality works across tasks, projects, and users

### Branding Verification

- [ ] App title "Anjam" appears correctly in browser tab
- [ ] All UI text uses appropriate terminology
- [ ] Documentation references are updated
- [ ] No "Task Manager" references remain in user-facing text

### Build and Release Verification

- [ ] `bun run build` completes successfully
- [ ] Release artifacts have correct names (anjam, anjam.exe, anjam-macos)
- [ ] ZIP package name is correct (anjam-windows.zip)
- [ ] Docker build works with updated names
- [ ] All launch scripts (run.sh, run.bat) work correctly

### URL and Domain Verification

- [ ] All internal links work correctly
- [ ] API calls use correct base URL in both dev and production
- [ ] File access URLs work properly
- [ ] Production domain ianjam.ir serves the application correctly

## Rollback Plan

If issues arise during the rename process:

1. **Immediate rollback**: `git checkout rename/anjam-backup`
2. **Restore from backup branch**: The backup branch contains the original "Task Manager" application
3. **Identify issues**: Use `git diff rename/anjam-backup rename/anjam` to identify problematic changes
4. **Fix and retry**: Address issues in the rename branch or start fresh

## Post-Rename Checklist

- [ ] All files in this plan have been updated
- [ ] Build system produces correctly named artifacts
- [ ] All tests pass (`bun run test:all`)
- [ ] Quality checks pass (`bun run check`)
- [ ] Documentation is updated and accurate
- [ ] No references to "Task Manager" remain in user-facing components
- [ ] Production deployment plan is ready for ianjam.ir
