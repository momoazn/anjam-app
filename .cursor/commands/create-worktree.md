# Create Worktree

Creates a Git worktree and branch from a document, file path, branch name, or feature description.

Automatically creates a Git worktree and branch from a document, file, or specified branch name.

## Instructions

1. **Identify Input**: The user may provide:
   - A file path (e.g., `plans/i18n-migration-plan.md`, `docs/architecture.md`)
   - A branch name directly (e.g., `feat/new-feature`)
   - A feature/task name that will be converted to a branch name
   - If not provided, prompt the user for input

2. **Determine Branch Name**:

   **If user provided a file path:**
   - Read the file to extract context (title, heading, or content)
   - Convert filename to branch name:
     - Remove common suffixes: `-plan.md`, `.md`, `.txt`, etc.
     - Convert to kebab-case if needed
     - Detect type from filename or content:
       - Keywords like "refactor", "refactoring" → `refactor/`
       - Keywords like "fix", "bug" → `fix/`
       - Keywords like "migration", "feature" → `feat/`
       - Keywords like "chore", "infra", "setup" → `chore/`
     - Default to `feat/` if type is unclear
   - Examples:
     - `plans/i18n-migration-plan.md` → `feat/i18n-migration`
     - `docs/technical-debt-refactoring.md` → `refactor/technical-debt`
     - `issues/bug-fix-123.md` → `fix/bug-fix-123`

   **If user provided a branch name:**
   - Use it directly (validate it follows naming conventions)
   - If it doesn't have a prefix (feat/, fix/, etc.), ask user which prefix to use or default to `feat/`

   **If user provided a feature/task name:**
   - Convert to kebab-case
   - Ask user for branch type prefix or infer from context
   - Examples:
     - "i18n migration" → `feat/i18n-migration`
     - "fix login bug" → `fix/login-bug`
     - "refactor auth" → `refactor/auth`

3. **Check Current Git Status**:
   - Run `git status` to ensure working tree is clean
   - If there are uncommitted changes, warn the user or ask if they want to proceed

4. **Check if Branch Already Exists**:
   - Run `git branch --list <branch-name>` to check if branch exists
   - If branch exists, ask user if they want to:
     - Use existing branch
     - Create new branch with different name
     - Delete and recreate (with confirmation)

5. **Check if Worktree Already Exists**:
   - Run `git worktree list` to check for existing worktrees
   - If worktree exists at `.worktrees/<branch-name>`, ask user if they want to:
     - Use existing worktree
     - Remove and recreate (with confirmation)

6. **Create Branch** (if needed):
   - If branch doesn't exist, create it from current branch:
     ```bash
     git checkout -b <branch-name>
     ```
   - Then switch back to original branch:
     ```bash
     git checkout <original-branch>
     ```

7. **Create Worktree**:
   - Create worktree in `.worktrees/` directory:
     ```bash
     git worktree add .worktrees/<branch-name> <branch-name>
     ```
   - This creates the worktree at `.worktrees/<branch-name>` and checks out the branch

8. **Verify Worktree Creation**:
   - Run `git worktree list` to confirm worktree was created
   - Display the worktree path to the user

9. **Display Summary**:
   - Show:
     - Branch name: `<branch-name>`
     - Worktree path: `<worktree-path>`
     - Source file/document: `<source-file>` (if applicable)
   - Provide instructions to navigate to worktree:
     ```bash
     cd <worktree-path>
     ```

## Branch Naming Convention

Follow Conventional Commits prefixes:

- **Features**: `feat/<name>` - New functionality
- **Bug fixes**: `fix/<name>` - Bug fixes
- **Refactoring**: `refactor/<name>` - Code restructuring
- **Chores**: `chore/<name>` - Maintenance, infrastructure
- **Documentation**: `docs/<name>` - Documentation changes
- **Style**: `style/<name>` - Formatting, styling
- **Performance**: `perf/<name>` - Performance improvements
- **Tests**: `test/<name>` - Test additions/changes

Extract type from:

- Filename patterns (e.g., `*-plan.md`, `*-refactoring.md`)
- File content (keywords in title/headings)
- User specification
- Default to `feat/` if unclear

## Worktree Location

By default, worktrees are created in `.worktrees/` directory:

- Path: `.worktrees/<branch-name>`
- This keeps them organized and separate from the main workspace
- User can optionally specify a custom path if needed

## Error Handling

- **Uncommitted changes**: Warn user, ask if they want to commit or stash first
- **Branch exists**: Ask user how to proceed (use existing, rename, or recreate)
- **Worktree exists**: Ask user how to proceed (use existing, remove and recreate)
- **Git errors**: Display error message and suggest solutions
- **File not found**: Error with helpful message, suggest similar files if available
- **Invalid branch name**: Validate branch name format, suggest corrections

## Example Usage

**Example 1: From file path**

- User provides: `plans/i18n-migration-plan.md`
- Extract name: `i18n-migration`
- Generate branch: `feat/i18n-migration`
- Create worktree: `.worktrees/i18n-migration`
- Result: Branch `feat/i18n-migration` at `.worktrees/i18n-migration`

**Example 2: Direct branch name**

- User provides: `feat/user-authentication`
- Use directly: `feat/user-authentication`
- Create worktree: `.worktrees/user-authentication`
- Result: Branch `feat/user-authentication` at `.worktrees/user-authentication`

**Example 3: Feature name**

- User provides: "refactor task components"
- Convert: `refactor/task-components`
- Create worktree: `.worktrees/task-components`
- Result: Branch `refactor/task-components` at `.worktrees/task-components`

**Example 4: From documentation**

- User provides: `docs/architecture/system-design.md`
- Extract: `system-design`
- Generate: `docs/system-design` or `feat/system-design` (based on context)
- Create worktree: `.worktrees/system-design`

## Notes

- The command assumes the repository is already initialized
- Worktrees are created from the current branch state
- The original branch remains checked out after worktree creation
- Worktrees share the same `.git` directory, so commits in worktree appear in main repo
- To remove a worktree later: `git worktree remove <worktree-path>`
- Works with any file type (markdown, text, code, etc.)
- Can be used for any purpose: features, refactoring, bug fixes, documentation, etc.

## Principles

- **Safety first**: Check for existing branches/worktrees before creating
- **User confirmation**: Ask before deleting/recreating existing resources
- **Clear feedback**: Show what was created and how to use it
- **Consistent naming**: Follow Conventional Commits conventions for branch names
- **Organized structure**: Keep all worktrees in `.worktrees/` directory by default
- **Flexible input**: Accept files, branch names, or feature descriptions
- **Smart inference**: Automatically detect branch type from context when possible
