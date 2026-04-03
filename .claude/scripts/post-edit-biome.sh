#!/usr/bin/env bash
set -euo pipefail

file="$(jq -r '.tool_input.file_path // .tool_input.path // empty' <<< "$(cat)")"

case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

[ -f "node_modules/.bin/biome" ] || exit 0

diag="$(node_modules/.bin/biome check --write "$file" 2>&1 | head -20)" || true

if [ -n "$diag" ]; then
  jq -Rn --arg msg "$diag" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $msg
    }
  }'
fi