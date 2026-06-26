#!/usr/bin/env node
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const LINK_MANIFEST = '.pnpm-links.json';

function ensureSymlink(target, linkPath) {
  mkdirSync(dirname(linkPath), { recursive: true });
  try {
    if (lstatSync(linkPath).isSymbolicLink() || lstatSync(linkPath).isDirectory()) {
      rmSync(linkPath, { recursive: true, force: true });
    }
  } catch {
    // link does not exist
  }
  symlinkSync(relative(dirname(linkPath), target), linkPath, 'dir');
}

function collectSymlinks(dashboardRoot, walkDir, links = []) {
  if (!existsSync(walkDir)) return links;

  for (const entry of readdirSync(walkDir, { withFileTypes: true })) {
    const fullPath = join(walkDir, entry.name);
    if (entry.isSymbolicLink()) {
      const rawTarget = readlinkSync(fullPath);
      const link = relative(dashboardRoot, fullPath).replaceAll('\\', '/');

      if (!rawTarget.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(rawTarget)) {
        const resolvedTarget = resolve(dirname(fullPath), rawTarget);
        if (!resolvedTarget.startsWith(dashboardRoot)) continue;
        links.push({ link, target: rawTarget.replaceAll('\\', '/'), relative: true });
        continue;
      }

      const resolvedTarget = resolve(rawTarget);
      if (!resolvedTarget.startsWith(dashboardRoot)) continue;
      links.push({
        link,
        target: relative(dashboardRoot, resolvedTarget).replaceAll('\\', '/'),
        relative: false,
      });
      continue;
    }

    if (entry.isDirectory()) {
      collectSymlinks(dashboardRoot, fullPath, links);
    }
  }

  return links;
}

export function captureDashboardLinks(root = cliRoot) {
  const dashboard = join(root, 'dashboard');
  if (!existsSync(join(dashboard, 'apps/dashboard/server.js'))) return false;

  const links = [
    ...collectSymlinks(dashboard, join(dashboard, 'node_modules'), []),
    ...collectSymlinks(dashboard, join(dashboard, 'apps/dashboard/node_modules'), []).filter(
      (entry) => !entry.link.startsWith('apps/dashboard/node_modules/@contextosai/'),
    ),
  ];

  writeFileSync(join(dashboard, LINK_MANIFEST), `${JSON.stringify({ links }, null, 2)}\n`);
  return true;
}

export function relinkOutsideSymlinks(dashboard) {
  const pnpmDir = join(dashboard, 'node_modules/.pnpm');
  if (!existsSync(pnpmDir)) return;

  const relinkDirs = [join(dashboard, 'node_modules'), join(dashboard, 'apps/dashboard/node_modules')];

  for (const relinkDir of relinkDirs) {
    relinkOutsideSymlinksInDir(dashboard, pnpmDir, relinkDir);
  }
}

function packageNameFromLinkPath(linkPath) {
  const parts = linkPath.split('/');
  const base = parts.at(-1);
  if (base && parts.at(-2)?.startsWith('@')) {
    return `${parts.at(-2)}/${base}`;
  }
  return base ?? '';
}

function relinkOutsideSymlinksInDir(dashboard, pnpmDir, walkDir) {
  if (!existsSync(walkDir)) return;

  for (const entry of readdirSync(walkDir, { withFileTypes: true })) {
    const linkPath = join(walkDir, entry.name);
    if (entry.isSymbolicLink()) {
      const rawTarget = readlinkSync(linkPath);
      const resolvedTarget = rawTarget.startsWith('/') || /^[A-Za-z]:[\\/]/.test(rawTarget)
        ? resolve(rawTarget)
        : resolve(dirname(linkPath), rawTarget);

      if (!resolvedTarget.startsWith(dashboard)) {
        const packageName = packageNameFromLinkPath(linkPath);
        const target = findPnpmPackage(pnpmDir, packageName);
        if (target && existsSync(target)) {
          ensureSymlink(target, linkPath);
        }
      }
      continue;
    }

    if (entry.isDirectory()) {
      relinkOutsideSymlinksInDir(dashboard, pnpmDir, linkPath);
    }
  }
}

function restoreManifestLinks(dashboard) {
  const manifestPath = join(dashboard, LINK_MANIFEST);
  if (!existsSync(manifestPath)) return false;

  const { links } = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let restored = 0;

  for (const entry of links) {
    const linkPath = join(dashboard, entry.link);
    mkdirSync(dirname(linkPath), { recursive: true });

    if (entry.relative) {
      const resolvedTarget = resolve(dirname(linkPath), entry.target);
      if (!resolvedTarget.startsWith(dashboard) || !existsSync(resolvedTarget)) continue;
      try {
        if (lstatSync(linkPath).isSymbolicLink() || lstatSync(linkPath).isDirectory()) {
          rmSync(linkPath, { recursive: true, force: true });
        }
      } catch {
        // link does not exist
      }
      symlinkSync(entry.target, linkPath, 'dir');
      restored += 1;
      continue;
    }

    const targetPath = join(dashboard, entry.target);
    if (!existsSync(targetPath)) continue;
    ensureSymlink(targetPath, linkPath);
    restored += 1;
  }

  return restored > 0;
}

function findPnpmPackage(pnpmDir, name) {
  if (name.startsWith('@')) {
    const [scope, pkg] = name.slice(1).split('/');
    const prefix = `@${scope}+${pkg}@`;
    const match = readdirSync(pnpmDir).find((entry) => entry.startsWith(prefix));
    if (!match) return null;
    return join(pnpmDir, match, 'node_modules', `@${scope}`, pkg);
  }

  const match = readdirSync(pnpmDir).find((entry) => entry.startsWith(`${name}@`));
  if (!match) return null;
  return join(pnpmDir, match, 'node_modules', name);
}

function restoreFallbackLinks(dashboard) {
  const pnpmDir = join(dashboard, 'node_modules/.pnpm');
  if (!existsSync(pnpmDir)) return false;

  const appModules = join(dashboard, 'apps/dashboard/node_modules');
  mkdirSync(appModules, { recursive: true });

  for (const name of ['next', 'react', 'react-dom']) {
    const target = findPnpmPackage(pnpmDir, name);
    if (target && existsSync(target)) {
      ensureSymlink(target, join(appModules, name));
    }
  }

  const nextEntry = readdirSync(pnpmDir).find((entry) => entry.startsWith('next@'));
  if (!nextEntry) return true;

  const nextModules = join(pnpmDir, nextEntry, 'node_modules');
  mkdirSync(nextModules, { recursive: true });

  const nextPkgPath = join(nextModules, 'next/package.json');
  if (!existsSync(nextPkgPath)) return true;

  const nextPkg = JSON.parse(readFileSync(nextPkgPath, 'utf8'));
  const packageNames = new Set([
    ...Object.keys(nextPkg.dependencies ?? {}),
    ...Object.keys(nextPkg.optionalDependencies ?? {}),
    ...Object.keys(nextPkg.peerDependencies ?? {}),
  ]);

  for (const name of packageNames) {
    const target = findPnpmPackage(pnpmDir, name);
    if (!target || !existsSync(target)) continue;

    const linkPath = name.startsWith('@')
      ? join(nextModules, name)
      : join(nextModules, name);
    ensureSymlink(target, linkPath);
  }

  return true;
}

function linkContextOsPackages(root) {
  const dashboard = join(root, 'dashboard');
  const scopedDir = join(dashboard, 'apps/dashboard/node_modules/@contextosai');
  mkdirSync(scopedDir, { recursive: true });

  for (const name of ['core', 'shared']) {
    const target = join(root, 'node_modules/@contextosai', name);
    if (existsSync(target)) {
      ensureSymlink(target, join(scopedDir, name));
    }
  }
}

export function fixDashboardLinks(root = cliRoot) {
  const dashboard = join(root, 'dashboard');
  if (!existsSync(join(dashboard, 'apps/dashboard/server.js'))) return false;

  relinkOutsideSymlinks(dashboard);
  restoreManifestLinks(dashboard);
  restoreFallbackLinks(dashboard);
  linkContextOsPackages(root);
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const capture = process.argv.includes('--capture');
  const rootArg = process.argv.find((arg) => !arg.startsWith('-') && arg !== process.argv[1] && arg !== process.argv[0]);
  const root = rootArg ? resolve(rootArg) : cliRoot;
  const ok = capture ? captureDashboardLinks(root) : fixDashboardLinks(root);
  if (ok) {
    console.log(capture ? 'Dashboard link manifest written.' : 'Dashboard module links restored.');
  }
}
