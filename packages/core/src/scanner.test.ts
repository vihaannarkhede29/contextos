import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scanRepository } from './scanner.js';

describe('scanRepository', () => {
  it('finds supported files and ignores node_modules', () => {
    const root = join(fileURLToPath(new URL('../..', import.meta.url)));
    const files = scanRepository(root);
    const paths = files.map((f) => f.relativePath);
    expect(paths.some((p) => p.endsWith('.ts'))).toBe(true);
    expect(paths.some((p) => p.includes('node_modules'))).toBe(false);
  });
});
