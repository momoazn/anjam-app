# App Renaming Plan: Task Manager → Anjam (انجام)

## Overview

This document outlines the steps to rename the "Task Manager" application to "Anjam" (انجام) and prepare production branding for `ianjam.ir`.

## Goals

1. Rename the application from "Task Manager" to "Anjam" (انجام)
2. Ensure production references use `ianjam.ir` (development remains `localhost`/`127.0.0.1`)
3. Maintain functionality while updating branding and references
4. Update build artifacts and release binaries to use the new naming

## Non-Goals

- Do not rename API routes, collection names, or internal domain concepts (e.g. `tasks`, `projects`)
- Do not change PocketBase schema or migrate existing data as part of this rename

## Files to Update

### 1. Frontend Files

- `index.html`: Update page title from "Task Manager" to "Anjam"
- `src/lib/pocketbase.ts`: Confirm base URL logic remains: production uses `/`, development uses `http://127.0.0.1:8090/`
- `src/hooks/use-saved-filters.ts`: Update storage keys from `task_manager_saved_filters` / `task_manager_default_filter` to `anjam_saved_filters` / `anjam_default_filter` (storage migration was removed - fresh start with new keys)

### 2. Backend Files

- `backend/main.go`: Update package documentation/comment strings from "task manager" to "anjam"
- `backend/go.mod`: Update the module path (only if this repo is meant to be imported as a module by other Go code)

> Note: Renaming a Go module path can be disruptive if there are internal imports like `moduleName/backend/...` or any external consumers. If the backend is only built as an app binary and not imported as a library, you can keep the module path as-is and still rename binaries/releases safely.

### 3. Configuration Files

- `package.json`: Update `"name"` from `task-manager-app` to `anjam-app`
- `infra/Dockerfile`: Update references to the backend executable name
- `infra/docker-compose.yml`: Update service name and any healthcheck/executable references
- `vite.config.ts`: No changes expected (dev proxy stays `http://localhost:8090`)
- `playwright.config.ts`: Only update if you run E2E against production and have hard-coded URLs

### 4. Build and Release Scripts

- `scripts/build.ts`: Update binary output names:
  - Linux: "task-manager" → "anjam"
  - Windows: "task-manager.exe" → "anjam.exe"
  - macOS: "task-manager-macos" → "anjam-macos"
- `scripts/build.ts`: Update ZIP package name from `task-manager-windows.zip` to `anjam-windows.zip`
- `scripts/start.ts`: Update binary path references
- `scripts/dev/run.sh`: Update comments and executable references
- `scripts/dev/run.bat`: Update comments and executable references
- `scripts/dev/run-with-env.bat`: Update comments and executable references

### 5. Documentation Files

- `README.md`: Update title and user-facing references from "Task Manager" to "Anjam"
- `AGENTS.md`: Update app naming references (keep technical identifiers like `TM_ALLOW_DEFAULT_ACCOUNTS` unless you intentionally change them)
- `docs/FULL_THESIS_PROPOSAL.md`: Update "Enterprise Task Manager" → "Anjam" where appropriate
- `docs/Audit_Logging_Plan.md`: Update references
- `docs/DEVELOPMENT_GUIDE.md`: Update release artifact references
- `docs/GitHub_Integration_Plan.md`: Update references
- `CLEANUP_PLAN.md`: Update title and references
- `CODEBASE_ISSUES.md`: Update references

### 6. Environment and Testing

- `bun.lock`: Updated automatically after `package.json` changes
- `e2e/auth.spec.ts`: Update URL/text expectations if any are branded or hard-coded
- `.gitignore`: Update ignored binary names if applicable

### 7. Build Artifacts and Release

- `.dockerignore`: Update ignored binary name if applicable
- **Release directory structure**: Update all references in documentation

## Implementation Steps

### Phase 1: Preparation

1. Create a backup branch (optional): `git checkout -b rename/anjam-backup`
2. Create a feature branch: `git checkout -b rename/anjam`
3. Decide whether you will rename the Go module path (`backend/go.mod`) or only rename binaries/branding

### Phase 2: Core Application Changes

1. `package.json`: Update `"name"`
2. `index.html`: Update page title
3. `src/hooks/use-saved-filters.ts`: Update storage keys (and optionally migrate old keys)
4. `backend/main.go`: Update doc/comment branding strings
5. `backend/go.mod`: Update module path (only if you chose to in Phase 1)

### Phase 3: Build System Updates

1. `scripts/build.ts`: Update binary output names and ZIP package name
2. `scripts/start.ts`: Update binary path references
3. `scripts/dev/run.sh`: Update script comments and references
4. `scripts/dev/run.bat`: Update script comments and references
5. `scripts/dev/run-with-env.bat`: Update script comments and references

### Phase 4: Infrastructure Updates

1. `infra/Dockerfile`: Update binary references
2. `infra/docker-compose.yml`: Update service name and healthcheck
3. `.gitignore`: Update ignored binary names
4. `.dockerignore`: Update ignored binary name

### Phase 5: Documentation Updates

1. `README.md`: Update title and all references
2. `AGENTS.md`: Update application references
3. `docs/DEVELOPMENT_GUIDE.md`: Update release artifact references
4. `docs/FULL_THESIS_PROPOSAL.md`: Update references
5. `docs/Audit_Logging_Plan.md`: Update references
6. `docs/GitHub_Integration_Plan.md`: Update references
7. `CLEANUP_PLAN.md`: Update title and references
8. `CODEBASE_ISSUES.md`: Update references

### Phase 6: Testing and Verification

1. Run `bun install` to update the lock file
2. Run `bun run check` (primary quality gate)
3. Run `bun run build` to ensure release artifacts still build
4. Run `bun run test:run` (unit tests)
5. Run `bun run test:e2e` (if applicable)
6. Verify UI branding text and browser title
7. Verify new binaries execute and scripts/Docker still start correctly

### Phase 7: Domain Configuration (Production)

1. Configure DNS records for `ianjam.ir`
2. Set up TLS certificates for `ianjam.ir`
3. Confirm reverse proxy / ingress config (if any) forwards `/api` and static assets correctly
4. Verify the backend serves the built React app correctly on the production domain
5. Test critical flows on `ianjam.ir` (login, list pages, create/update flows)

## Important Considerations

### Backward Compatibility

- API endpoints remain unchanged (e.g., `/api/tasks`, `/api/projects`) for technical consistency
- Database collection names remain unchanged for compatibility
- Role names (admin, manager, supervisor, employee) remain unchanged as they are role types, not app-specific branding

### Database Schema

- Keep collection names (`tasks`, `projects`, `users`, etc.) unchanged for API compatibility
- No database migration needed for renaming
- Auto-generated TypeScript types in `src/lib/pocketbase-types.ts` remain valid

### URL Structure

- Frontend routes remain unchanged (`/tasks`, `/projects`, etc.)
- API routes remain unchanged for consistency
- In production, API requests use relative URLs (base URL: "/") since React app is served by backend
- In development, API requests continue to use `http://127.0.0.1:8090/` (or whatever dev base URL is configured)

### Search and Replace Guidelines

- **Case-sensitive replacements**: "Task Manager" → "Anjam", "task-manager" → "anjam", "task_manager" → "anjam"
- **Avoid over-replacement**: Don't change "tasks" to "anjam" in API routes or code contexts
- **Binary names**: Replace "task-manager" with "anjam" in build outputs and scripts
- **Package names**: Replace "task-manager-app" with "anjam-app" in package.json

### Environment Variables

- Prefer keeping existing env var names unless you also implement backward-compatible support (e.g. accept both for a deprecation window).
- If you do rename variables (e.g. `TM_ALLOW_DEFAULT_ACCOUNTS` → `ANJAM_ALLOW_DEFAULT_ACCOUNTS`), update backend code + docs together.

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
- [ ] Production domain `ianjam.ir` serves the application correctly

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
