import { describe, it, expect } from 'vitest';
import { parseFile } from './parser.js';

describe('parseFile', () => {
  it('extracts TypeScript symbols', async () => {
    const content = `
import React from 'react';
export class App {}
export function main() {}
// comment
`;
    const result = await parseFile(content, '.tsx');
    expect(result.imports.length).toBeGreaterThan(0);
    expect(result.classes).toContain('App');
    expect(result.functions).toContain('main');
  });

  it('extracts Python symbols', async () => {
    const content = `
from fastapi import FastAPI
class UserService:
    pass
def get_user():
    pass
`;
    const result = await parseFile(content, '.py');
    expect(result.classes).toContain('UserService');
    expect(result.functions).toContain('get_user');
  });
});
