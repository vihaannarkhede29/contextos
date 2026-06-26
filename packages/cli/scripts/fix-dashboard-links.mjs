#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function ensureSymlink(target, linkPath) {
  mkdirSync(dirname(linkPath), { recursive: true });
  if (existsSync(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true });
  }
  symlinkSync(relative(dirname(linkPath), target), linkPath, 'dir');
}

export function fixDashboardLinks(root = cliRoot) {
  const dashboard = join(root, 'dashboard');
  if (!existsSync(join(dashboard, 'apps/dashboard/server.js'))) return false;

  const pnpmDir = join(dashboard, 'node_modules/.pnpm');
  const appModules = join(dashboard, 'apps/dashboard/node_modules');
  mkdirSync(appModules, { recursive: true });

  if (existsSync(pnpmDir)) {
    for (const name of ['next', 'react', 'react-dom']) {
      const match = readdirSync(pnpmDir).find((entry) => entry.startsWith(`${name}@`));
      if (!match) continue;
      const target = join(pnpmDir, match, 'node_modules', name);
      if (existsSync(target)) {
        ensureSymlink(target, join(appModules, name));
      }
    }
  }

  const scopedDir = join(appModules, '@contextosai');
  mkdirSync(scopedDir, { recursive: true });
  for (const name of ['core', 'shared']) {
    const target = join(root, 'node_modules/@contextosai', name);
    if (existsSync(target)) {
      ensureSymlink(target, join(scopedDir, name));
    }
  }

  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (fixDashboardLinks()) {
    console.log('Dashboard module links restored.');
  }
}
