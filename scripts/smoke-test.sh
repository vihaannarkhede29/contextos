#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

cd "$TMPDIR"
git init -q
git config user.email "smoke@test.com"
git config user.name "Smoke Test"

cat > app.ts <<'EOF'
export function authenticate() {
  return 'auth middleware';
}
EOF

git add .
git commit -q -m "init"

node "$ROOT/packages/cli/dist/index.js" init
node "$ROOT/packages/cli/dist/index.js" index
node "$ROOT/packages/cli/dist/index.js" stats
node "$ROOT/packages/cli/dist/index.js" search "auth middleware" --limit 3
node "$ROOT/packages/cli/dist/index.js" export

test -f .cursor/rules/contextos.mdc
test -f AGENTS.md
test -f .contextos/project.md

echo "Smoke test passed."
