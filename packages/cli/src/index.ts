#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  ensureContextOSDir,
  Indexer,
  isInitialized,
  saveConfig,
  searchRepository,
  FileWatcher,
  ContextDatabase,
  exportAgentContextOnly,
  startMcpServer,
  EmbeddingDimensionMismatchError,
} from '@contextos/core';
import { ContextOSConfigSchema, DASHBOARD_PORT } from '@contextos/shared';
import open from 'open';
import { killPort } from './kill-port.js';

const require = createRequire(import.meta.url);
const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf-8'),
) as { version: string };

const program = new Command();

function getRoot(): string {
  return process.cwd();
}

function requireInit(root: string): void {
  if (!isInitialized(root)) {
    console.error(chalk.red('ContextOS not initialized. Run: contextos init'));
    process.exit(1);
  }
}

program
  .name('contextos')
  .description('Local-first memory layer for AI coding agents')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize ContextOS in the current repository')
  .option('--no-agent-export', 'Disable auto-generation of Cursor rules and AGENTS.md')
  .action((opts: { agentExport: boolean }) => {
    const root = getRoot();
    if (isInitialized(root)) {
      console.log(chalk.yellow('ContextOS is already initialized.'));
      return;
    }
    ensureContextOSDir(root);
    const config = ContextOSConfigSchema.parse({
      agentExportEnabled: opts.agentExport,
    });
    saveConfig(root, config);
    console.log(chalk.green('✓ ContextOS initialized'));
    console.log(chalk.dim(`  Created .contextos/ in ${root}`));
    console.log(chalk.dim('  Run: contextos index'));
  });

program
  .command('index')
  .description('Index the repository')
  .option('-i, --incremental', 'Only index changed files')
  .option('-f, --force', 'Force full re-index and reset embedding provider')
  .action(async (opts: { incremental?: boolean; force?: boolean }) => {
    const root = getRoot();
    requireInit(root);
    console.log(chalk.cyan('Indexing repository...'));
    const indexer = new Indexer(root);
    try {
      const result = await indexer.index({
        incremental: opts.incremental ?? false,
        force: opts.force ?? false,
        onProgress: (msg) => console.log(chalk.dim(`  ${msg}`)),
      });
      console.log(chalk.green('✓ Indexing complete'));
      console.log(`  Files indexed: ${chalk.bold(result.filesIndexed)}`);
      console.log(`  Files skipped: ${chalk.bold(result.filesSkipped)}`);
      console.log(`  Decisions learned: ${chalk.bold(result.decisionsLearned)}`);
      console.log(`  Rules extracted: ${chalk.bold(result.rulesExtracted)}`);
    } finally {
      await indexer.close();
    }
  });

program
  .command('export')
  .description('Regenerate Cursor rules and AGENTS.md from current index')
  .action(() => {
    const root = getRoot();
    requireInit(root);
    exportAgentContextOnly(root);
    console.log(chalk.green('✓ Exported .cursor/rules/contextos.mdc and AGENTS.md'));
  });

program
  .command('mcp')
  .description('Start MCP server (stdio) for AI agent integration')
  .action(async () => {
    const root = getRoot();
    requireInit(root);
    await startMcpServer(root);
  });

program
  .command('watch')
  .description('Watch for file changes and re-index incrementally')
  .action(async () => {
    const root = getRoot();
    requireInit(root);
    console.log(chalk.cyan('Starting file watcher...'));
    const watcher = new FileWatcher(root);
    watcher.start({
      onEvent: (msg) => console.log(chalk.dim(`  ${msg}`)),
    });

    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\nStopping watcher...'));
      await watcher.stop();
      process.exit(0);
    });
  });

program
  .command('search')
  .description('Semantic search across indexed files')
  .argument('<query>', 'Search query')
  .option('-l, --limit <number>', 'Max results', '10')
  .action(async (query: string, opts: { limit: string }) => {
    const root = getRoot();
    requireInit(root);
    console.log(chalk.cyan(`Searching: "${query}"`));
    try {
      const results = await searchRepository(root, query, parseInt(opts.limit, 10));
      if (results.length === 0) {
        console.log(chalk.yellow('No results found. Run: contextos index'));
        return;
      }
      for (const result of results) {
        const score = (result.score * 100).toFixed(1);
        console.log(`\n${chalk.bold(result.path)} ${chalk.dim(`(${score}% match)`)}`);
        console.log(chalk.dim(result.summary.slice(0, 200)));
      }
    } catch (err) {
      if (err instanceof EmbeddingDimensionMismatchError) {
        console.error(chalk.red(err.message));
        process.exit(1);
      }
      throw err;
    }
  });

program
  .command('stats')
  .description('Show indexing statistics')
  .action(() => {
    const root = getRoot();
    requireInit(root);
    const db = new ContextDatabase(root);
    const stats = db.getStats();
    db.close();

    console.log(chalk.cyan('ContextOS Stats'));
    console.log(`  Files indexed:     ${chalk.bold(stats.filesIndexed)}`);
    console.log(`  Decisions learned: ${chalk.bold(stats.decisionsLearned)}`);
    console.log(`  Rules extracted:   ${chalk.bold(stats.rulesExtracted)}`);
    console.log(
      `  Last indexed:      ${chalk.bold(stats.lastIndexedAt ?? 'Never')}`,
    );
  });

program
  .command('dashboard')
  .description('Open the local dashboard')
  .option('-p, --port <number>', 'Port number', String(DASHBOARD_PORT))
  .action(async (opts: { port: string }) => {
    const root = getRoot();
    requireInit(root);

    const port = parseInt(opts.port, 10);
    const url = `http://localhost:${port}/app`;

    killPort(port);

    const cliDir = dirname(fileURLToPath(import.meta.url));
    const bundledRoot = join(cliDir, '../dashboard');
    const bundledServerNested = join(bundledRoot, 'apps/dashboard/server.js');
    const bundledServerFlat = join(bundledRoot, 'server.js');
    const monorepoDashboard = join(cliDir, '../../../apps/dashboard');

    process.env.CONTEXTOS_ROOT = root;
    process.env.PORT = String(port);
    process.env.HOSTNAME = 'localhost';

    let serverPath: string | null = null;
    let cwd: string;

    if (existsSync(bundledServerNested)) {
      serverPath = bundledServerNested;
      cwd = join(bundledRoot, 'apps/dashboard');
    } else if (existsSync(bundledServerFlat)) {
      serverPath = bundledServerFlat;
      cwd = bundledRoot;
    } else if (existsSync(join(monorepoDashboard, 'package.json'))) {
      console.log(chalk.cyan(`Starting dashboard (dev) at ${url}...`));
      const child = spawn(
        'npx',
        ['pnpm@9.15.0', '--filter', '@contextos/dashboard', 'dev'],
        {
          cwd: join(cliDir, '../../..'),
          stdio: 'inherit',
          env: { ...process.env, CONTEXTOS_ROOT: root, PORT: String(port) },
        },
      );
      setTimeout(() => {
        open(url).catch(() => console.log(chalk.dim(`Open ${url} in your browser`)));
      }, 3000);
      child.on('exit', (code) => process.exit(code ?? 0));
      return;
    } else {
      console.error(chalk.red('Dashboard not found. Reinstall contextos or build from source.'));
      process.exit(1);
    }

    console.log(chalk.cyan(`Starting dashboard at ${url}...`));
    const child = spawn(process.execPath, [serverPath!], {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CONTEXTOS_ROOT: root, PORT: String(port), HOSTNAME: 'localhost' },
    });

    setTimeout(() => {
      open(url).catch(() => console.log(chalk.dim(`Open ${url} in your browser`)));
    }, 2000);

    child.on('exit', (code) => process.exit(code ?? 0));
  });

program.parse();
