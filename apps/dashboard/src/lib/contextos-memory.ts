import 'server-only';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { CONTEXTOS_DIR, PROJECT_MEMORY_FILE } from '@contextosai/shared';
import { getProjectRoot } from './contextos-db';

export function readProjectMemory(): string {
  try {
    return readFileSync(
      join(getProjectRoot(), CONTEXTOS_DIR, PROJECT_MEMORY_FILE),
      'utf-8',
    );
  } catch {
    return '# No project memory yet\n\nRun `contextosai index` to generate.';
  }
}
