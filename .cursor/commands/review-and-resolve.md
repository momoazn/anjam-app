# Review, Commit, Push & Resolve

Comprehensive command for reviewing PR issues, committing changes, pushing to remote, and resolving GitHub review conversations.

## Purpose

Streamlines the entire PR workflow:

1. Review issues and comments on a PR
2. Commit changes with proper messages
3. Push commits to remote
4. Resolve review conversation threads

## Instructions

### 1. **Review PR Issues & Comments**

**Get PR Details:**

```bash
gh pr view [PR_NUMBER] --json comments,reviews,reviewDecision
```

**List all inline comments:**

```bash
gh api repos/[OWNER]/[REPO]/pulls/[PR_NUMBER]/comments
```

**Check for unresolved review threads:**

```bash
gh api graphql -f 'query=query {
  repository(owner: "[OWNER]", name: "[REPO]") {
    pullRequest(number: [PR_NUMBER]) {
      reviewThreads(first: 50) {
        nodes { id isResolved }
      }
    }
  }
}'
```

**Display review summary:**

- Show total comments and suggestions
- List open threads
- Highlight critical vs. minor issues
- Show review decision status

### 2. **Commit Changes**

**Check git status:**

```bash
git status
```

**Stage files:**

```bash
git add [FILES] or git add .
```

**Create commit with conventional message:**

```bash
git commit -m "[TYPE]([SCOPE]): [DESCRIPTION]"
```

**Types:** feat, fix, refactor, chore, docs, style, test, perf

**Example:**

```bash
git commit -m "fix(pr-review): address code review feedback on error handling"
```

### 3. **Push to Remote**

**Push to current branch:**

```bash
git push origin [BRANCH_NAME]
```

**Force push (only if necessary):**

```bash
git push origin [BRANCH_NAME] --force-with-lease
```

**Verify push:**

```bash
git log -1 --oneline  # Shows current commit
```

### 4. **Resolve Review Conversations**

**Resolve individual thread:**

```bash
gh api graphql -f 'query=mutation {
  resolveReviewThread(input: {threadId: "[THREAD_ID]"}) {
    thread { isResolved }
  }
}'
```

**Resolve all unresolved threads (Python script):**

```python
import subprocess
import json

# Get PR number (from environment or argument)
pr_number = "29"  # Replace with actual PR number

# Query for unresolved threads
query = f'''query {{
  repository(owner: "mohammadhmn", name: "anjam") {{
    pullRequest(number: {pr_number}) {{
      reviewThreads(first: 50) {{
        nodes {{ id isResolved }}
      }}
    }}
  }}
}}'''

result = subprocess.run(
    ['gh', 'api', 'graphql', '-f', f'query={query}'],
    capture_output=True, text=True
)

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

    result = subprocess.run(
        ['gh', 'api', 'graphql', '-f', f'query={mutation}'],
        capture_output=True, text=True
    )

    if result.returncode == 0:
        data = json.loads(result.stdout)
        resolved = data.get('data', {}).get('resolveReviewThread', {}).get('thread', {}).get('isResolved', False)
        if resolved:
            resolved_count += 1
            print(f"✅ {tid[:35]}...")

print(f"\n{'='*60}")
print(f"✅ Successfully resolved: {resolved_count}/{len(unresolved)}")
print(f"{'='*60}")
```

**Verify all threads resolved:**

```bash
gh api graphql -f 'query=query {
  repository(owner: "mohammadhmn", name: "anjam") {
    pullRequest(number: [PR_NUMBER]) {
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

## Complete Workflow

### Option 1: Manual Steps

```bash
# 1. Review issues
gh pr view 29 --json comments,reviews

# 2. Make fixes and stage changes
git add .

# 3. Commit with message
git commit -m "fix(pr-29): resolve all review comments"

# 4. Push changes
git push origin [BRANCH_NAME]

# 5. Resolve threads (Python script)
python3 resolve_threads.py 29
```

### Option 2: Automated Script

Create `pr-review-workflow.sh`:

```bash
#!/bin/bash

PR_NUMBER=${1:-29}
OWNER="mohammadhmn"
REPO="anjam"

echo "🔍 Reviewing PR #$PR_NUMBER..."
gh pr view $PR_NUMBER --json comments,reviews

echo -e "\n📝 Git status:"
git status

echo -e "\n💾 Committing changes..."
git add .
git commit -m "fix(pr-$PR_NUMBER): resolve code review feedback" || echo "No changes to commit"

echo -e "\n🚀 Pushing to remote..."
git push origin $(git branch --show-current) || echo "Already up to date"

echo -e "\n🔗 Resolving conversation threads..."
python3 << 'PYTHON'
import subprocess
import json

pr_number = "$PR_NUMBER"
query = f'''query {{ repository(owner: "{OWNER}", name: "{REPO}") {{ pullRequest(number: {pr_number}) {{ reviewThreads(first: 50) {{ nodes {{ id isResolved }} }} }} }} }}'''

result = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={query}'], capture_output=True, text=True)
data = json.loads(result.stdout)
threads = data['data']['repository']['pullRequest']['reviewThreads']['nodes']
unresolved = [t['id'] for t in threads if not t['isResolved']]

resolved_count = 0
for tid in unresolved:
    mutation = f'''mutation {{ resolveReviewThread(input: {{threadId: "{tid}"}}) {{ thread {{ isResolved }} }} }}'''
    result = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={mutation}'], capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        if data.get('data', {}).get('resolveReviewThread', {}).get('thread', {}).get('isResolved', False):
            resolved_count += 1
            print(f"✅ Resolved thread")

print(f"\n✅ Successfully resolved: {resolved_count}/{len(unresolved)}")
PYTHON

echo -e "\n✅ Workflow complete!"
```

## Example Usage

```bash
# Review PR #29, commit, push, and resolve all threads
/review-and-resolve 29

# Or run full workflow
./pr-review-workflow.sh 29
```

## Key Features

- ✅ Review all PR comments and suggestions
- ✅ Proper git workflow with conventional commits
- ✅ Automatic push to remote
- ✅ Resolve all GitHub conversation threads
- ✅ Verification steps to confirm success
- ✅ Clear status reporting
- ✅ Error handling and feedback

## Parameters

- **PR_NUMBER**: GitHub PR number (default: 29)
- **FILES**: Specific files to commit (default: all)
- **BRANCH_NAME**: Branch to push to (default: current branch)

## Status Output

```
🔍 Reviewing PR #29...
[PR details and comments]

📝 Git status:
On branch fix/pr-issues
Changes not staged for commit:
  modified: backend/handlers/users.go

💾 Committing changes...
[commit details]

🚀 Pushing to remote...
[push details]

🔗 Resolving conversation threads...
✅ Resolved thread 1
✅ Resolved thread 2
...
✅ Successfully resolved: 12/12

✅ Workflow complete!
```

## Prerequisites

- Git installed and configured
- GitHub CLI (`gh`) installed and authenticated
- Python 3 (for thread resolution script)
- Active git repository

## Error Handling

- **No changes**: Skips commit if working tree is clean
- **Push failed**: Shows error and suggests solutions
- **Thread resolution failed**: Reports individual failures
- **Permission denied**: Suggests checking authentication

## Notes

- Always review changes before committing
- Use `--force-with-lease` instead of `--force` for safety
- Commits use Conventional Commits format
- Thread resolution requires proper GitHub permissions
- Works with any branch and remote
- Safe to run multiple times (idempotent for threads)

## Related Commands

- `create-worktree` - Create feature branches
- `gh pr view` - View PR details
- `git log` - View commit history
- `gh pr status` - Check PR status
