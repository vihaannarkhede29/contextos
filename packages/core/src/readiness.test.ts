import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ContextOSConfigSchema, PROJECT_MEMORY_FILE, CONTEXTOS_DIR } from '@contextosai/shared';
import { ContextDatabase } from './database.js';
import { saveConfig } from './config.js';
import { computeReadiness } from './readiness.js';

function write(root: string, relative: string, content: string): void {
  const full = join(root, relative);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content);
}

describe('computeReadiness', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'contextos-readiness-'));
    saveConfig(dir, ContextOSConfigSchema.parse({ agentExportEnabled: true }));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('scores low when repo has almost no agent/setup signals', () => {
    const db = new ContextDatabase(dir);
    db.close();

    const report = computeReadiness(dir);

    expect(report.level).toBeLessThanOrEqual(2);
    expect(report.dimensions).toHaveLength(6);
    expect(report.nextSteps.length).toBeGreaterThan(0);
    const agentMemory = report.dimensions.find((d) => d.id === 'agent_memory');
    expect(agentMemory?.checks.find((c) => c.id === 'index_exists')?.passed).toBe(false);
  });

  it('scores agent memory highly when index + exports exist', () => {
    write(dir, 'AGENTS.md', '# Agents\n');
    write(dir, '.cursor/rules/contextos.mdc', '---\nalwaysApply: true\n---\n# Memory\n');
    write(dir, join(CONTEXTOS_DIR, PROJECT_MEMORY_FILE), '# Overview\n');
    write(dir, 'README.md', '# Demo\n');
    write(dir, 'docs/guide.md', '# Guide\n');
    write(
      dir,
      'package.json',
      JSON.stringify({
        scripts: { build: 'tsc', test: 'vitest', lint: 'eslint .' },
        devDependencies: { vitest: '2.0.0', eslint: '9.0.0', prettier: '3.0.0' },
      }),
    );
    write(dir, 'pnpm-lock.yaml', 'lockfileVersion: 9\n');
    write(dir, '.github/workflows/ci.yml', 'name: ci\non: push\njobs: {}\n');
    write(dir, 'tsconfig.json', JSON.stringify({ compilerOptions: { strict: true } }));
    write(dir, 'eslint.config.mjs', 'export default [];\n');
    write(dir, '.prettierrc', '{}\n');
    write(dir, '.env.example', 'KEY=\n');
    write(dir, 'SECURITY.md', '# Security\n');
    write(dir, '.github/dependabot.yml', 'version: 2\nupdates: []\n');

    const db = new ContextDatabase(dir);
    const now = new Date().toISOString();
    db.upsertFile({
      id: 'f1',
      path: 'src/index.ts',
      extension: '.ts',
      size: 100,
      hash: 'a',
      imports: ["import { describe } from 'vitest';"],
      exports: [],
      classes: [],
      functions: ['main'],
      comments: ['// hello'],
      summary: 'Main entrypoint for the application',
      indexedAt: now,
    });
    db.upsertFile({
      id: 'f2',
      path: 'src/index.test.ts',
      extension: '.ts',
      size: 50,
      hash: 'b',
      imports: ["import { describe, it } from 'vitest';"],
      exports: [],
      classes: [],
      functions: [],
      comments: [],
      summary: 'Tests',
      indexedAt: now,
    });
    db.upsertFile({
      id: 'f3',
      path: 'README.md',
      extension: '.md',
      size: 20,
      hash: 'c',
      imports: [],
      exports: [],
      classes: [],
      functions: [],
      comments: [],
      summary: 'Readme',
      indexedAt: now,
    });
    db.upsertFile({
      id: 'f4',
      path: 'docs/guide.md',
      extension: '.md',
      size: 20,
      hash: 'd',
      imports: [],
      exports: [],
      classes: [],
      functions: [],
      comments: [],
      summary: 'Guide',
      indexedAt: now,
    });
    db.upsertRule({
      id: 'r1',
      category: 'framework',
      name: 'Vitest',
      description: 'Uses Vitest',
      confidence: 0.9,
    });
    db.upsertRule({
      id: 'r2',
      category: 'convention',
      name: 'Colocated Tests',
      description: 'Tests colocated',
      confidence: 0.9,
    });
    db.upsertDecision({
      id: 'd1',
      title: 'Adopt SQLite',
      decision: 'Use SQLite locally',
      source: 'git commit',
      confidence: 0.9,
      commitHash: 'abc123',
      createdAt: now,
    });
    db.setMeta('lastIndexedAt', now);
    db.close();

    const report = computeReadiness(dir);

    expect(report.overallScore).toBeGreaterThanOrEqual(70);
    expect(report.level).toBeGreaterThanOrEqual(3);
    const agentMemory = report.dimensions.find((d) => d.id === 'agent_memory');
    expect(agentMemory?.grade).toMatch(/^[AB]$/);
    expect(agentMemory?.checks.every((c) => c.passed)).toBe(true);
    expect(report.dimensions.find((d) => d.id === 'build')?.grade).toMatch(/^[AB]$/);
    expect(report.dimensions.find((d) => d.id === 'security')?.grade).toMatch(/^[AB]$/);
  });
});
