import { describe, it, expect } from 'vitest';
import { extractDecisionsFromGit } from './git-analyzer.js';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

describe('extractDecisionsFromGit', () => {
  it('deduplicates decisions with stable ids', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'contextos-git-'));
    execSync('git init', { cwd: dir });
    execSync('git config user.email "test@test.com"', { cwd: dir });
    execSync('git config user.name "Test"', { cwd: dir });
    writeFileSync(join(dir, 'README.md'), '# test');
    execSync('git add .', { cwd: dir });
    execSync('git commit -m "migrate redux to zustand"', { cwd: dir });

    const first = await extractDecisionsFromGit(dir);
    const second = await extractDecisionsFromGit(dir);

    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBe(first.length);
    expect(second[0]!.id).toBe(first[0]!.id);
  });
});
