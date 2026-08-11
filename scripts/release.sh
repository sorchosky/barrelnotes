#!/usr/bin/env bash
# Show what's stacked on dev and waiting to ship to main.
#
# Read-only. This script does not merge, push, or open anything — promoting dev
# to main is a production deploy and stays a human decision (see CLAUDE.md).
# It prints the release notes and the compare URL; you open the PR.
#
# Usage: scripts/release.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "Fetching latest dev and main..."
git -C "$REPO_ROOT" fetch origin dev main

AHEAD="$(git -C "$REPO_ROOT" rev-list --count origin/main..origin/dev)"

if [ "$AHEAD" -eq 0 ]; then
  echo ""
  echo "Nothing to release — dev has no commits that main doesn't."
  exit 0
fi

echo ""
echo "$AHEAD commit(s) on dev not yet in main:"
echo ""
git -C "$REPO_ROOT" log --no-merges --format='  %s' origin/main..origin/dev

echo ""
echo "Files changed:"
git -C "$REPO_ROOT" diff --stat origin/main...origin/dev | tail -n 20

# Derive the compare URL from the origin remote, handling both SSH and HTTPS.
REMOTE="$(git -C "$REPO_ROOT" remote get-url origin)"
SLUG="$(printf '%s' "$REMOTE" | sed -E 's#^git@github\.com:##; s#^https://github\.com/##; s#\.git$##')"

echo ""
echo "Open the release PR:"
echo "  https://github.com/${SLUG}/compare/main...dev"
echo ""
echo "Merge it as a MERGE COMMIT, not a squash — squashing flattens the"
echo "features into one commit and leaves dev and main permanently diverged."
