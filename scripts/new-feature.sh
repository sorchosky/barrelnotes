#!/usr/bin/env bash
# Create a dedicated git worktree + branch for a new feature.
#
# Usage: scripts/new-feature.sh <slug> [base-branch]
#   <slug>         name of the work, e.g. bottle-search
#   [base-branch]  branch to cut from; defaults to $BASE_BRANCH, else dev.
#                  BarrelNotes is three-tier — cut from dev, never from main.
#
# Prefix the slug to change the branch type:
#   scripts/new-feature.sh bottle-search        -> feature/bottle-search
#   scripts/new-feature.sh fix/scan-timeout     -> fix/scan-timeout
#   scripts/new-feature.sh docs/readme-refresh  -> docs/readme-refresh
#
# Example: scripts/new-feature.sh bottle-search

set -euo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: scripts/new-feature.sh <slug> [base-branch]"
  exit 1
fi

BASE="${2:-${BASE_BRANCH:-dev}}"

if [ "$BASE" = "main" ]; then
  echo "Refusing to cut a work branch from main."
  echo "BarrelNotes cuts from dev; main only ever receives release PRs."
  echo "Pass an explicit base branch if you really mean something else."
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"

# An unprefixed slug is a feature; an explicit prefix is respected as-is.
case "$SLUG" in
  feature/*|fix/*|docs/*) BRANCH="$SLUG" ;;
  *)                      BRANCH="feature/${SLUG}" ;;
esac

# Worktree dir uses the slug without its prefix, so fix/foo doesn't nest a dir.
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-worktrees/${BRANCH##*/}"

if [ -e "$WORKTREE_DIR" ]; then
  echo "Worktree path $WORKTREE_DIR already exists. Aborting."
  exit 1
fi

echo "Fetching latest $BASE..."
git -C "$REPO_ROOT" fetch origin "$BASE"

echo "Creating worktree at $WORKTREE_DIR on branch $BRANCH (from origin/$BASE)..."
git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WORKTREE_DIR" "origin/$BASE"

# Carry over local env vars so Claude Code has ANTHROPIC_API_KEY in the worktree
if [ -f "$REPO_ROOT/.env.local" ]; then
  cp "$REPO_ROOT/.env.local" "$WORKTREE_DIR/.env.local"
  echo "Copied .env.local into worktree."
else
  echo "No .env.local found — scanning won't work in the worktree without ANTHROPIC_API_KEY."
fi

echo ""
echo "Worktree ready. Next steps:"
echo "  cd $WORKTREE_DIR"
echo "  npm install"
echo "  claude    # start Claude Code in this worktree"
echo ""
echo "When it's done, open a PR from $BRANCH into $BASE."
