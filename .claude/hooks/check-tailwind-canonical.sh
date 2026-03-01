#!/bin/bash
# PostToolUse hook: after file edit, remind Claude to check IDE diagnostics for suggestCanonicalClasses.
# Delegates detection entirely to the IDE (Tailwind CSS IntelliSense) — no regex duplication.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE_PATH" ] && exit 0

# Only check relevant file types
case "$FILE_PATH" in
  *.tsx|*.ts|*.jsx|*.js|*.html|*.md|*.mdx|*.vue|*.svelte) ;;
  *) exit 0 ;;
esac

[ ! -f "$FILE_PATH" ] && exit 0

echo "File edited: $FILE_PATH — Run mcp__ide__getDiagnostics and check for suggestCanonicalClasses warnings. If any exist, fix them immediately by replacing the arbitrary class with the canonical one from the diagnostic message." >&2
exit 0
