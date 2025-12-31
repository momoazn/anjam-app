---
description: Fix PR review comments and resolve conversations
agent: build
---

Follow this workflow to fix PR review feedback and resolve conversations for PR #$1.

See detailed workflow documentation in @docs/workflows/pr-fix-resolve.md

## Quick Summary

1. **Fetch**: `gh pr view $1 --json comments,reviews`
2. **Fix**: Read files, make changes, run `bun run check`
3. **Commit**: `git add . && git commit -m "fix(scope): description"`
4. **Push**: `git push origin $(git branch --show-current)`
5. **Resolve**: See full workflow in @docs/workflows/pr-fix-resolve.md

Begin by fetching the PR #$1 conversations and reviewing what needs to be fixed.
