import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTEXTOS_DIR,
  PROJECT_MEMORY_FILE,
  scoreRepoSnapshot,
  type RepoSnapshot,
  type ReadinessReport,
} from '@contextosai/shared';
import { ContextDatabase } from './database.js';
import { loadConfig } from './config.js';

const KEY_FILES = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'readme.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  '.env.example',
  '.env.sample',
  '.prettierrc',
  '.prettierrc.json',
  'prettier.config.js',
  'prettier.config.mjs',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  '.eslintrc.json',
  '.eslintrc.js',
  'biome.json',
  'biome.jsonc',
  '.cursor/rules/contextos.mdc',
  join(CONTEXTOS_DIR, PROJECT_MEMORY_FILE),
  '.github/dependabot.yml',
  'renovate.json',
];

function collectPaths(root: string, dir: string, out: string[], depth = 0): void {
  if (depth > 8) return;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (
      entry === 'node_modules' ||
      entry === '.git' ||
      entry === 'dist' ||
      entry === 'build' ||
      entry === '.next' ||
      entry === 'coverage'
    ) {
      continue;
    }
    const full = join(dir, entry);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }
    const rel = full.slice(root.length + 1).replaceAll('\\', '/');
    if (isDir) {
      collectPaths(root, full, out, depth + 1);
    } else {
      out.push(rel);
    }
  }
}

/**
 * Compute local-first Agent Readiness for an indexed ContextOS project.
 */
export function computeReadiness(rootPath: string): ReadinessReport {
  const config = loadConfig(rootPath);
  const db = new ContextDatabase(rootPath);
  let files: RepoSnapshot['files'] = [];
  let rules: RepoSnapshot['rules'] = [];
  let stats = {
    filesIndexed: 0,
    decisionsLearned: 0,
    rulesExtracted: 0,
    lastIndexedAt: null as string | null,
  };

  try {
    files = db.getAllFiles().map((f) => ({
      path: f.path,
      imports: f.imports,
      comments: f.comments,
      summary: f.summary,
    }));
    rules = db.getRules().map((r) => ({ category: r.category, name: r.name }));
    stats = db.getStats();
  } finally {
    db.close();
  }

  const paths: string[] = [];
  collectPaths(rootPath, rootPath, paths);

  // Prefer indexed file paths when available
  const pathSet = new Set([...paths, ...files.map((f) => f.path)]);

  const contents: Record<string, string> = {};
  for (const rel of KEY_FILES) {
    const full = join(rootPath, rel);
    if (existsSync(full)) {
      try {
        contents[rel.replaceAll('\\', '/')] = readFileSync(full, 'utf-8');
      } catch {
        // skip
      }
    }
  }

  const snapshot: RepoSnapshot = {
    paths: [...pathSet],
    contents,
    stats,
    rules,
    files,
    agentExportEnabled: config.agentExportEnabled,
    remote: false,
  };

  return scoreRepoSnapshot(snapshot);
}

export { scoreRepoSnapshot };
