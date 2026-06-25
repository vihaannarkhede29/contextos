import { describe, it, expect } from 'vitest';
import { validateEmbeddingDimensions, EmbeddingDimensionMismatchError } from './embeddings.js';

describe('validateEmbeddingDimensions', () => {
  it('passes when dimensions match', () => {
    expect(() => validateEmbeddingDimensions(384, 384)).not.toThrow();
  });

  it('passes when index dimensions unknown', () => {
    expect(() => validateEmbeddingDimensions(undefined, 384)).not.toThrow();
  });

  it('throws on mismatch', () => {
    expect(() => validateEmbeddingDimensions(768, 384)).toThrow(EmbeddingDimensionMismatchError);
  });
});
