#!/usr/bin/env bash
# Whether a change needs the app E2E suite (CI workflow). Reads changed paths on stdin, prints
# `app=true|false` for $GITHUB_OUTPUT: anything but documentation and repository tooling.
# Any error exits non-zero, so CI fails instead of silently skipping the suite.
set -euo pipefail

docs='^(docs/|\.githooks/|\.github/pull_request_template\.md$|\.claude/|[^/]*\.md$)'

# grep exits 1 when nothing matches (an answer) and 2 on error (a failure).
lines() {
  local status=0
  grep -E "$@" || status=$?
  [ "$status" -le 1 ] || exit "$status"
}

files="$(cat)"
app=false
code="$(printf '%s\n' "$files" | lines -v "$docs" | lines -v '^$')"
[ -n "$code" ] && app=true
echo "app=$app"
