# PR Review Fix & Resolve Workflow

Follow this workflow to fix PR review feedback and resolve conversations.

## Step 1: Fetch PR Conversations

First, fetch all review comments and conversations from the PR:

```bash
gh pr view $1 --json comments,reviews --jq '.comments[] | "\(.path):\(.line) - \(.body | split("\n")[0])"'
```

Also check for unresolved review threads to get thread IDs:

```bash
gh api graphql -f 'query={
  repository(owner: "mohammadhmn", name: "anjam") {
    pullRequest(number: $1) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          comments(first: 1) {
            nodes {
              path
              line
              body
            }
          }
        }
      }
    }
  }
}'
```

## Step 2: Review and Fix Issues

Review each comment and fix the issues in the code. Make sure to:

- Read the relevant files mentioned in the comments
- Understand the feedback
- Make the necessary changes
- Run quality checks: `bun run check`
- Run tests: `bun run test:run`

## Step 3: Group Changes into Logical Commits

View the changes you've made:

```bash
git status
git diff
```

Group related changes into logical commits. Use conventional commit format:

- `fix(scope): description` for bug fixes
- `refactor(scope): description` for refactoring
- `chore(scope): description` for cleanup

Example:

```bash
git add backend/handlers/users.go
git commit -m "fix(handlers): improve error handling in user endpoints"

git add backend/hooks/tasks.go
git commit -m "fix(tasks): implement missing status ref"
```

## Step 4: Push Changes

```bash
git push origin $(git branch --show-current)
```

## Step 5: Resolve All Conversations

Resolve all unresolved review threads:

```bash
gh api graphql -f "query={
  repository(owner: \"mohammadhmn\", name: \"anjam\") {
    pullRequest(number: $1) {
      reviewThreads(first: 50) { nodes { id isResolved } }
    }
  }
}" | python3 -c "
import subprocess, json, sys

data = json.load(sys.stdin)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']
unresolved = [t['id'] for t in threads if not t['isResolved']]

resolved = 0
for tid in unresolved:
    result = subprocess.run(['gh', 'api', 'graphql', '-f', f'query=mutation {{ resolveReviewThread(input: {{threadId: \"{tid}\"}}) {{ thread {{ isResolved }} }} }}'], capture_output=True, text=True)
    if result.returncode == 0:
        resolved += 1

print(f'✅ Resolved {resolved}/{len(unresolved)} threads')
"
```

## Verification

Verify all threads are resolved:

```bash
gh api graphql -f 'query={
  repository(owner: "mohammadhmn", name: "anjam") {
    pullRequest(number: $1) {
      reviewThreads(first: 50) {
        nodes { isResolved }
      }
    }
  }
}' 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']
resolved = sum(1 for t in threads if t['isResolved'])
total = len(threads)
status = '✅ ALL RESOLVED' if resolved == total else f'⏳ {total - resolved} pending'
print(f'Conversation Status: {resolved}/{total} resolved {status}')
"
```
