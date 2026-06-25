import { describe, it, expect } from 'vitest';
import { extractArchitectureRules } from './rules.js';
import type { FileMetadata } from '@contextos/shared';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const baseFile = (path: string): FileMetadata => ({
  id: '1',
  path,
  extension: '.ts',
  size: 100,
  hash: 'abc',
  imports: [],
  exports: [],
  classes: [],
  functions: [],
  comments: [],
  indexedAt: new Date().toISOString(),
});

describe('extractArchitectureRules', () => {
  it('detects Next.js from package.json deps, not README mentions', () => {
    const dir = mkdtempSync(join(tmpdir(), 'contextos-rules-'));
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { next: '15.0.0', react: '19.0.0' } }),
    );
    writeFileSync(join(dir, 'README.md'), 'This project mentions FastAPI and Prisma in docs.');
    const files = [baseFile('README.md'), baseFile('app/page.tsx')];

    const rules = extractArchitectureRules(dir, files);
    const names = rules.map((r) => r.name);

    expect(names).toContain('Next.js');
    expect(names).not.toContain('FastAPI');
    expect(names).not.toContain('Prisma');

    rmSync(dir, { recursive: true, force: true });
  });
});
