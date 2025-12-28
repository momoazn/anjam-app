#!/bin/bash

# Simple Review & Fix Command
# Usage: ./review-fix.sh [PR_NUMBER]

PR_NUMBER=${1:-29}
OWNER="mohammadhmn"
REPO="anjam"

echo "🔍 Fetching PR #$PR_NUMBER issues..."
gh pr view "$PR_NUMBER" --json comments --jq '.comments | length' > /tmp/comment_count.txt
COMMENT_COUNT=$(cat /tmp/comment_count.txt)
echo "Found $COMMENT_COUNT review comments"

echo ""
echo "📋 Issues:"
gh api repos/"$OWNER"/"$REPO"/pulls/"$PR_NUMBER"/comments --jq '.[] | "\(.line): \(.body | split("\n")[0])"' 2>/dev/null | head -10

echo ""
echo "💾 Committing fixes..."
if git diff --quiet; then
    echo "ℹ️  No changes to commit"
else
    git add .
    git commit -m "fix(pr-$PR_NUMBER): address code review feedback"
    echo "✅ Committed"
fi

echo ""
echo "🚀 Pushing..."
BRANCH=$(git branch --show-current)
git push origin "$BRANCH" 2>/dev/null || echo "Already up to date"
echo "✅ Pushed"

echo ""
echo "🔗 Resolving threads..."

python3 << 'PYTHON'
import subprocess
import json
import sys

pr_number = sys.argv[1] if len(sys.argv) > 1 else "29"
owner = "mohammadhmn"
repo = "anjam"

query = f'''query {{ repository(owner: "{owner}", name: "{repo}") {{ pullRequest(number: {pr_number}) {{ reviewThreads(first: 50) {{ nodes {{ id isResolved }} }} }} }} }}'''

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
        if data.get('data', {}).get('resolveReviewThread', {}).get('thread', {}).get('isResolved'):
            resolved_count += 1

print(f"✅ Resolved {resolved_count}/{len(unresolved)} threads")
PYTHON
    "$PR_NUMBER"

echo ""
echo "✅ Done!"
