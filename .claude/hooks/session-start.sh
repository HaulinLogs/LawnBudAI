#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "=== LawnBudAI Session Start ==="
echo "Installing dependencies in LawnBudAI/..."
cd "$CLAUDE_PROJECT_DIR/LawnBudAI"
yarn install
echo "✅ Dependencies installed"

echo ""
echo "=== RULES REMINDER (RULES.md) ==="
cat "$CLAUDE_PROJECT_DIR/RULES.md"
