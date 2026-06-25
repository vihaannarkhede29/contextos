import { describe, it, expect } from 'vitest';
import { cosineDistanceToScore } from './vectors.js';

describe('cosineDistanceToScore', () => {
  it('maps zero distance to score 1', () => {
    expect(cosineDistanceToScore(0)).toBe(1);
  });

  it('maps distance 2 to score 0', () => {
    expect(cosineDistanceToScore(2)).toBe(0);
  });

  it('maps distance 1 to score 0.5', () => {
    expect(cosineDistanceToScore(1)).toBe(0.5);
  });

  it('clamps negative distances', () => {
    expect(cosineDistanceToScore(-0.5)).toBe(1);
  });
});
