#!/usr/bin/env node
/**
 * Kill stale dashboard, rebundle, and start fresh.
 * Usage: npm run dashboard
 */
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 3000);

function killPort(p) {
  try {
    const out = spawnSync('lsof', ['-nP', `-iTCP:${p}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf-8',
    });
    const pids = (out.stdout ?? '').trim().split('\n').filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        /* already gone */
      }
    }
    if (pids.length) {
      console.log(`Freed port ${p}`);
    }
  } catch {
    /* port free */
  }
}

killPort(port);

const bundle = spawnSync('node', ['packages/cli/scripts/bundle-dashboard.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

if (bundle.status !== 0) {
  process.exit(bundle.status ?? 1);
}

const cli = spawn('node', ['packages/cli/dist/index.js', 'dashboard', '--port', String(port)], {
  cwd: root,
  stdio: 'inherit',
});

cli.on('exit', (code) => process.exit(code ?? 0));
