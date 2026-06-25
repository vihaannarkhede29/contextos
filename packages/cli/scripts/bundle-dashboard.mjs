#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(__dirname, '../../..');
const dashboardApp = join(monorepoRoot, 'apps/dashboard');
const cliDashboard = join(__dirname, '../dashboard');

function deployWorkspacePackage(filter, destDir) {
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
  mkdirSync(destDir, { recursive: true });

  const result = spawnSync(
    'npx',
    ['pnpm@9.15.0', '--filter', filter, 'deploy', destDir],
    { cwd: monorepoRoot, stdio: 'inherit' },
  );

  if (result.status !== 0) {
    console.error(`Failed to deploy ${filter}`);
    process.exit(result.status ?? 1);
  }
}

function fixPackageSymlink(bundleRoot, packageName) {
  const linkDir = join(bundleRoot, 'apps/dashboard/node_modules/@contextos');
  const linkPath = join(linkDir, packageName);
  mkdirSync(linkDir, { recursive: true });
  if (existsSync(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true });
  }
  symlinkSync(`../../../../packages/${packageName}`, linkPath, 'dir');
}

function patchStandaloneBundle(bundleRoot) {
  console.log('Patching standalone bundle with workspace packages...');

  const sharedDest = join(bundleRoot, 'packages/shared');
  const coreDest = join(bundleRoot, 'packages/core');

  deployWorkspacePackage('@contextos/shared', sharedDest);
  deployWorkspacePackage('@contextos/core', coreDest);

  const sharedLink = join(coreDest, 'node_modules/@contextos/shared');
  mkdirSync(join(coreDest, 'node_modules/@contextos'), { recursive: true });
  if (existsSync(sharedLink)) {
    rmSync(sharedLink, { recursive: true, force: true });
  }
  symlinkSync('../../../../shared', sharedLink, 'dir');

  fixPackageSymlink(bundleRoot, 'core');
  fixPackageSymlink(bundleRoot, 'shared');

  console.log('  Deployed @contextos/shared and @contextos/core with runtime deps');
}

console.log('Building dashboard...');
const build = spawn('npx', ['pnpm@9.15.0', '--filter', '@contextos/dashboard', 'build'], {
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
      "const { ContextDatabase } = require('@contextos/core/database'); const db = new ContextDatabase(process.env.CONTEXTOS_ROOT); db.close();",
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
