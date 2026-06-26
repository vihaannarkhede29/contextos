import 'server-only';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CONTEXTOS_DB, CONTEXTOS_DIR } from '@contextosai/shared';

export function getProjectRoot(): string {
  return process.env.CONTEXTOS_ROOT ?? process.cwd();
}

function getDatabasePath(root = getProjectRoot()): string {
  return join(root, CONTEXTOS_DIR, CONTEXTOS_DB);
}

/** True when the dashboard can read a real indexed project (local CLI), not a hosted marketing deploy. */
export function isLocalDashboardAvailable(): boolean {
  if (process.env.CONTEXTOS_ROOT) return true;
  if (existsSync(getDatabasePath())) return true;
  if (process.env.NETLIFY || process.env.VERCEL) return false;
  return true;
}

export async function tryGetDatabase() {
  if (!isLocalDashboardAvailable()) return null;

  try {
    const { ContextDatabase } = await import('@contextosai/core/database');
    return new ContextDatabase(getProjectRoot());
  } catch {
    return null;
  }
}

export async function getDatabase() {
  const db = await tryGetDatabase();
  if (!db) {
    throw new Error('Local ContextOS index not available');
  }
  return db;
}
