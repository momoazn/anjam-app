---
description: Fix PR review comments and resolve conversations
agent: build
---

Follow this workflow to fix PR review feedback and resolve conversations for PR #$1:

## Step 1: Fetch PR Conversations

First, fetch all review comments and conversations from PR #$1:

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

## Step 5: Resolve Fixed Conversations

After pushing changes, resolve all review threads that you fixed. Use this Python script:

```python
import subprocess
import json

pr_number = "$1"
owner = "mohammadhmn"
repo = "anjam"

query = f'''query {{
  repository(owner: "{owner}", name: "{repo}") {{
    pullRequest(number: {pr_number}) {{
      reviewThreads(first: 50) {{
        nodes {{ id isResolved }}
      }}
    }}
  }}
}}'''

result = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True, text=True)
data = json.loads(result.stdout)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']
unresolved = [t['id'] for t in threads if not t['isResolved']]

print(f"Resolving {len(unresolved)} conversation threads...\n")

resolved_count = 0
for tid in unresolved:
    mutation = f'''mutation {{
      resolveReviewThread(input: {{threadId: "{tid}"}}) {{
        thread {{ isResolved }}
      }}
    }}'''

    result = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={mutation}'], capture_output=True, text=True)

    if result.returncode == 0:
        data = json.loads(result.stdout)
        if data.get('data', {}).get('resolveReviewThread', {}).get('thread', {}).get('isResolved', False):
            resolved_count += 1
            print(f"✅ Resolved thread: {tid[:35]}...")

print(f"\n{'='*60}")
print(f"✅ Successfully resolved: {resolved_count}/{len(unresolved)}")
print(f"{'='*60}")
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
}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']
resolved = sum(1 for t in threads if t['isResolved'])
total = len(threads)
status = '✅ ALL RESOLVED' if resolved == total else f'⏳ {total - resolved} pending'
print(f'Conversation Status: {resolved}/{total} resolved {status}')
"
```

Begin by fetching the PR #$1 conversations and reviewing what needs to be fixed.
