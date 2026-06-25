import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTEXTOS_DIR,
  CONFIG_FILE,
  ContextOSConfig,
  ContextOSConfigSchema,
} from '@contextos/shared';

export function getContextOSPath(rootPath: string): string {
  return join(rootPath, CONTEXTOS_DIR);
}

export function getConfigPath(rootPath: string): string {
  return join(getContextOSPath(rootPath), CONFIG_FILE);
}

export function ensureContextOSDir(rootPath: string): string {
  const dir = getContextOSPath(rootPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function loadConfig(rootPath: string): ContextOSConfig {
  const configPath = getConfigPath(rootPath);
  if (!existsSync(configPath)) {
    return ContextOSConfigSchema.parse({});
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8')) as unknown;
  return ContextOSConfigSchema.parse(raw);
}

export function saveConfig(rootPath: string, config: ContextOSConfig): void {
  ensureContextOSDir(rootPath);
  writeFileSync(getConfigPath(rootPath), JSON.stringify(config, null, 2));
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function generateId(): string {
  return randomUUID();
}

export function isInitialized(rootPath: string): boolean {
  return existsSync(getConfigPath(rootPath));
}
