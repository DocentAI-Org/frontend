#!/usr/bin/env bash
# Which E2E suites a change needs (CI workflow). Reads changed paths on stdin, prints
# `app=true|false` and `prototype=true|false` for $GITHUB_OUTPUT.
#   app:       anything but documentation, repository tooling and the prototype.
#   prototype: the prototype, its tests, or what serves them (dependencies, Next.js config, CI).
# Any error exits non-zero, so CI fails instead of silently skipping a suite.
set -euo pipefail

docs='^(specs/|docs/|plans/|\.githooks/|\.github/pull_request_template\.md$|\.specify/|\.claude/|\.agents/|\.impeccable/|[^/]*\.md$)'
prototype_only='^(public/prototype/|tests/prototype/)'
prototype='^(public/prototype/|tests/prototype/|playwright\.config\.ts$|package(-lock)?\.json$|next\.config\.ts$|vercel\.ts$|src/proxy\.ts$|\.github/workflows/ci\.yml$)'

# grep exits 1 when nothing matches (an answer) and 2 on error (a failure).
matches() {
  local status=0
  grep -E "$@" >/dev/null || status=$?
  [ "$status" -le 1 ] || exit "$status"
  [ "$status" -eq 0 ]
}
lines() {
  local status=0
  grep -E "$@" || status=$?
  [ "$status" -le 1 ] || exit "$status"
}

files="$(cat)"
app=false
prototype_needed=false
code="$(printf '%s\n' "$files" | lines -v "$docs" | lines -v "$prototype_only" | lines -v '^$')"
[ -n "$code" ] && app=true
printf '%s\n' "$files" | matches "$prototype" && prototype_needed=true
echo "app=$app"
echo "prototype=$prototype_needed"
