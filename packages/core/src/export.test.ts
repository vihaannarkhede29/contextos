import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ContextDatabase } from './database.js';
import { exportAgentContext } from './export.js';
import { saveConfig } from './config.js';
import { ContextOSConfigSchema } from '@contextos/shared';

describe('exportAgentContext', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'contextos-export-'));
    saveConfig(dir, ContextOSConfigSchema.parse({ agentExportEnabled: true }));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('generates cursor rules and AGENTS.md', () => {
    const db = new ContextDatabase(dir);
    db.upsertRule({
      id: 'r1',
      category: 'framework',
      name: 'Next.js',
      description: 'Next.js 15',
      confidence: 0.95,
    });
    exportAgentContext(dir, db);
    db.close();

    expect(existsSync(join(dir, '.cursor/rules/contextos.mdc'))).toBe(true);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(true);
    const content = readFileSync(join(dir, '.cursor/rules/contextos.mdc'), 'utf-8');
    expect(content).toContain('Next.js');
    expect(content).toContain('alwaysApply: true');
  });
});
