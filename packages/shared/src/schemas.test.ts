import { describe, it, expect } from 'vitest';
import { ContextOSConfigSchema, FileMetadataSchema } from './schemas.js';

describe('ContextOSConfigSchema', () => {
  it('parses default config', () => {
    const config = ContextOSConfigSchema.parse({});
    expect(config.embeddingProvider).toBe('ollama');
    expect(config.embeddingModel).toBe('nomic-embed-text');
  });
});

describe('FileMetadataSchema', () => {
  it('validates file metadata', () => {
    const meta = FileMetadataSchema.parse({
      id: 'abc',
      path: 'src/index.ts',
      extension: '.ts',
      size: 100,
      hash: 'hash123',
      imports: ['react'],
      exports: ['App'],
      classes: ['App'],
      functions: ['main'],
      comments: ['// hello'],
      indexedAt: new Date().toISOString(),
    });
    expect(meta.path).toBe('src/index.ts');
  });
});
