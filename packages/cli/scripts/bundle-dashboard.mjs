#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixDashboardLinks } from './fix-dashboard-links.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(__dirname, '../../..');
const cliRoot = join(__dirname, '..');
const dashboardApp = join(monorepoRoot, 'apps/dashboard');
const cliDashboard = join(cliRoot, 'dashboard');

/** Restore module links npm pack strips from the standalone dashboard bundle. */
function patchStandaloneBundle(bundleRoot) {
  console.log('Linking bundled dashboard runtime modules...');

  const packagesDir = join(bundleRoot, 'packages');
  if (existsSync(packagesDir)) {
    rmSync(packagesDir, { recursive: true, force: true });
  }

  fixDashboardLinks(cliRoot);
  console.log('  Linked dashboard runtime modules');
}

console.log('Building dashboard...');
const build = spawn('npx', ['pnpm@9.15.0', '--filter', '@contextosai/dashboard', 'build'], {
  cwd: monorepoRoot,
  stdio: 'inherit',
});

build.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }

  const standalone = join(dashboardApp, '.next/standalone');
  const staticDir = join(dashboardApp, '.next/static');
  const publicDir = join(dashboardApp, 'public');

  if (!existsSync(standalone)) {
    console.error('Dashboard standalone build not found. Ensure output: standalone in next.config.');
    process.exit(1);
  }

  if (existsSync(cliDashboard)) {
    rmSync(cliDashboard, { recursive: true, force: true });
  }
  mkdirSync(cliDashboard, { recursive: true });

  cpSync(standalone, cliDashboard, { recursive: true });
  patchStandaloneBundle(cliDashboard);

  const nestedApp = join(cliDashboard, 'apps/dashboard');
  const nestedStatic = join(nestedApp, '.next/static');
  if (existsSync(nestedApp)) {
    mkdirSync(join(nestedApp, '.next'), { recursive: true });
    if (existsSync(nestedStatic)) {
      rmSync(nestedStatic, { recursive: true, force: true });
    }
    cpSync(staticDir, nestedStatic, { recursive: true });
    if (existsSync(publicDir)) {
      cpSync(publicDir, join(nestedApp, 'public'), { recursive: true });
    }
  } else {
    mkdirSync(join(cliDashboard, '.next'), { recursive: true });
    const flatStatic = join(cliDashboard, '.next/static');
    if (existsSync(flatStatic)) {
      rmSync(flatStatic, { recursive: true, force: true });
    }
    cpSync(staticDir, flatStatic, { recursive: true });
    if (existsSync(publicDir)) {
      cpSync(publicDir, join(cliDashboard, 'public'), { recursive: true });
    }
  }

  const serverJs = join(cliDashboard, 'apps/dashboard/server.js');
  if (!existsSync(serverJs) && !existsSync(join(cliDashboard, 'server.js'))) {
    console.error('server.js not found in bundled dashboard');
    process.exit(1);
  }

  const verify = spawnSync(
    process.execPath,
    [
      '-e',
      "const { ContextDatabase } = require('@contextosai/core/database'); const db = new ContextDatabase(process.env.CONTEXTOS_ROOT); db.close();",
    ],
    {
      cwd: join(cliDashboard, 'apps/dashboard'),
      env: { ...process.env, CONTEXTOS_ROOT: monorepoRoot },
      stdio: 'inherit',
    },
  );

  if (verify.status !== 0) {
    console.error('Bundled dashboard failed database smoke check');
    process.exit(verify.status ?? 1);
  }

  console.log('Dashboard bundled to packages/cli/dashboard');
});
