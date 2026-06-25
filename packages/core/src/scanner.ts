import { readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import {
  IGNORED_DIRS,
  IGNORED_FILE_PATTERNS,
  SUPPORTED_EXTENSIONS,
} from '@contextos/shared';

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  extension: string;
  size: number;
}

function shouldIgnore(name: string, isDir: boolean): boolean {
  if (isDir && IGNORED_DIRS.has(name)) return true;
  return IGNORED_FILE_PATTERNS.some((p) => p.test(name));
}

export function scanRepository(rootPath: string): ScannedFile[] {
  const results: ScannedFile[] = [];

  function walk(dir: string): void {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (shouldIgnore(entry, true)) continue;
        walk(fullPath);
      } else if (stat.isFile()) {
        if (shouldIgnore(entry, false)) continue;
        const ext = extname(entry).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
        results.push({
          absolutePath: fullPath,
          relativePath: relative(rootPath, fullPath),
          extension: ext,
          size: stat.size,
        });
      }
    }
  }

  walk(rootPath);
  return results;
}
