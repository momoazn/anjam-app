# Review & Fix

Simple command to review PR issues, fix them, commit, push, and resolve threads.

## Usage

```bash
/review-fix [PR_NUMBER]
```

## What It Does

1. Fetches all review comments from the PR
2. Displays the issues
3. Commits any changes with a fix message
4. Pushes to remote
5. Resolves all review threads

## Example

```bash
/review-fix 29
```

Output:

```
🔍 Fetching PR #29 issues...
Found 6 review comments

📋 Issues:
  1. backend/handlers/users.go:177 - error handling fix needed
  2. backend/hooks/tasks.go:209 - implement setTaskStatusRef
  3. backend/config/constants.go:142 - remove duplicate constant
  4. backend/handlers/auth.go:97 - remove redundant wrappers
  5. backend/hooks/notifications.go:185 - add robustness check
  6. backend/hooks/users.go:20 - simplify if/else

💾 Committing fixes...
✅ Committed: fix(pr-29): address code review feedback

🚀 Pushing...
✅ Pushed to origin/branch-name

🔗 Resolving threads...
✅ Resolved 12/12 conversation threads

✅ Done!
```

## Parameters

- `PR_NUMBER`: GitHub PR number (required)

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Git repository
- Read access to PR

## What Happens

The command:

- Fetches PR review comments via GitHub API
- Shows you what needs to be fixed
- Automatically commits changes (assumes you've already fixed them)
- Pushes the commits
- Resolves all conversation threads

It's designed to work after you've manually fixed the issues in your code.
