#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREFIX="${NPM_PREFIX:-$HOME/.local}"

mkdir -p "$PREFIX/bin"
npm config set prefix "$PREFIX"

echo "Building CLI..."
cd "$ROOT"
npx pnpm@9.15.0 --filter contextosai build

echo "Linking contextosai to $PREFIX/bin ..."
cd "$ROOT/packages/cli"
npm link

echo ""
echo "Done. Ensure this is in your PATH (add to ~/.zshrc if needed):"
echo "  export PATH=\"$PREFIX/bin:\$PATH\""
echo ""
echo "Then run: contextosai --version"
