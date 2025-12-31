#!/bin/bash

# Script to resolve PR review comments
# Usage: ./resolve-comments.sh [PR_NUMBER]

PR_NUMBER=${1:-31}
OWNER="mohammadhmn"
REPO="anjam"

# Comment IDs to resolve (from Gemini Code Assist review)
COMMENT_IDS=(
  "2653966213"  # TaskSubtasksSection issue
  "2653966214"  # IsFeatureDisabledError issue
  "2653966215"  # Code duplication issue
)

echo "🔍 Resolving PR #$PR_NUMBER review comments..."

RESOLVED=0
for COMMENT_ID in "${COMMENT_IDS[@]}"; do
  echo "   Resolving comment $COMMENT_ID..."
  if gh api graphql -f query='
    mutation {
      resolveReviewThread($input: ResolveReviewThreadInput!) {
        resolveReviewThread(input: $input) {
          thread { id }
        }
      }
    }
  }
  ' -F "input={threadId: \"$COMMENT_ID\", isResolved: true}" > /dev/null 2>&1; then
    echo "     ✅ Resolved $COMMENT_ID"
    RESOLVED=$((RESOLVED + 1))
  else
    echo "     ❌ Failed to resolve $COMMENT_ID"
  fi
done

echo ""
echo "✅ Done! Resolved $RESOLVED/$((RESOLVED)) comments"
