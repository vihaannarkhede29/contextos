import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ArchitectureRule, FileMetadata } from '@contextosai/shared';
import { FRAMEWORK_DEPS, FRAMEWORK_PATTERNS, PROJECT_MEMORY_FILE } from '@contextosai/shared';
import { generateId } from './config.js';
import { getContextOSPath } from './config.js';

const CONVENTION_RULES: Array<{
  name: string;
  description: string;
  detect: (files: FileMetadata[], packageJson: Record<string, unknown> | null) => boolean;
  confidence: number;
}> = [
  {
    name: 'Server Actions',
    description: 'Use server actions for mutations.',
    detect: (files) => files.some((f) => f.path.includes('actions') || f.summary?.includes("'use server'")),
    confidence: 0.85,
  },
  {
    name: 'App Router',
    description: 'Use Next.js App Router (app/ directory).',
    detect: (files) => files.some((f) => f.path.startsWith('app/')),
    confidence: 0.9,
  },
  {
    name: 'Colocated Tests',
    description: 'Tests are colocated with source files.',
    detect: (files) => files.some((f) => f.path.includes('.test.') || f.path.includes('.spec.')),
    confidence: 0.8,
  },
];

function readPackageJson(rootPath: string): Record<string, unknown> | null {
  const pkgPath = join(rootPath, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function detectFrameworks(
  rootPath: string,
  files: FileMetadata[],
): ArchitectureRule[] {
  const rules: ArchitectureRule[] = [];
  const codeFiles = files.filter((f) => !f.path.endsWith('.md') && !f.path.endsWith('.mdx'));
  const allContent = codeFiles
    .slice(0, 100)
    .map((f) => {
      try {
        return readFileSync(join(rootPath, f.path), 'utf-8');
      } catch {
        return '';
      }
    })
    .join('\n');

  const pkg = readPackageJson(rootPath);
  const deps = {
    ...(pkg?.dependencies as Record<string, string> | undefined),
    ...(pkg?.devDependencies as Record<string, string> | undefined),
  };

  for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    const depKeys = FRAMEWORK_DEPS[framework] ?? [];
    const depMatch = depKeys.some((d) => d in (deps ?? {}));
    const patternMatch = patterns.some((p) => p.test(allContent));

    if (!depMatch && !patternMatch) continue;

    // Require dependency match unless pattern found in actual code files
    if (!depMatch && !patternMatch) continue;
    if (!depMatch && patternMatch) {
      // Regex-only in code — lower confidence, skip doc-driven false positives
      const version = depKeys.find((d) => deps?.[d]) ?? '';
      rules.push({
        id: generateId(),
        category: 'framework',
        name: framework,
        description: `Uses ${framework}`,
        confidence: 0.65,
      });
      continue;
    }

    const matchedDep = depKeys.find((d) => deps?.[d]);
    const version = matchedDep ? deps?.[matchedDep] : '';
    rules.push({
      id: generateId(),
      category: 'framework',
      name: framework,
      description: version ? `${framework} ${version}` : `Uses ${framework}`,
      confidence: depMatch && patternMatch ? 0.95 : 0.85,
    });
  }

  return rules;
}

function detectImportantModules(files: FileMetadata[]): ArchitectureRule[] {
  const modulePatterns = [
    { pattern: /(?:lib|src)\/auth/i, name: 'Authentication', desc: 'Authentication module' },
    { pattern: /(?:lib|src)\/payment/i, name: 'Payments', desc: 'Payments module' },
    { pattern: /(?:lib|src)\/db/i, name: 'Database', desc: 'Database layer' },
    { pattern: /(?:lib|src)\/api/i, name: 'API', desc: 'API layer' },
    { pattern: /components\/ui/i, name: 'UI Components', desc: 'Shared UI components (shadcn/ui)' },
  ];

  const rules: ArchitectureRule[] = [];
  for (const { pattern, name, desc } of modulePatterns) {
    const matching = files.filter((f) => pattern.test(f.path));
    if (matching.length > 0) {
      const dir = matching[0]!.path.split('/').slice(0, 2).join('/');
      rules.push({
        id: generateId(),
        category: 'module',
        name,
        description: `${desc}: ${dir}`,
        confidence: 0.85,
      });
    }
  }
  return rules;
}

export function extractArchitectureRules(
  rootPath: string,
  files: FileMetadata[],
): ArchitectureRule[] {
  const rules: ArchitectureRule[] = [
    ...detectFrameworks(rootPath, files),
    ...detectImportantModules(files),
  ];

  const pkg = readPackageJson(rootPath);
  for (const conv of CONVENTION_RULES) {
    if (conv.detect(files, pkg)) {
      rules.push({
        id: generateId(),
        category: 'convention',
        name: conv.name,
        description: conv.description,
        confidence: conv.confidence,
      });
    }
  }

  return rules;
}

export function generateProjectMemory(
  rootPath: string,
  rules: ArchitectureRule[],
  files: FileMetadata[],
): string {
  const frameworks = rules.filter((r) => r.category === 'framework');
  const conventions = rules.filter((r) => r.category === 'convention');
  const modules = rules.filter((r) => r.category === 'module');

  const lines: string[] = ['# Project Overview', ''];

  if (frameworks.length) {
    const primary = frameworks[0];
    lines.push(`Framework: ${primary?.name}${primary?.description.includes(primary.name) ? '' : ''}`);
    if (primary?.description && !primary.description.startsWith('Uses')) {
      lines.push(`Version: ${primary.description.replace(/^Next\.js\s*/, '')}`);
    }
    lines.push('');
  }

  lines.push('## Architecture Rules', '');
  for (const rule of [...frameworks, ...conventions]) {
    lines.push(`* ${rule.description}`);
  }
  lines.push('');

  if (modules.length) {
    lines.push('## Important modules', '');
    for (const mod of modules) {
      lines.push(`* ${mod.name}: ${mod.description}`);
    }
    lines.push('');
  }

  lines.push('## Indexed Files', '');
  lines.push(`Total: ${files.length} files`);
  lines.push('');

  return lines.join('\n');
}

export function writeProjectMemory(rootPath: string, content: string): void {
  const path = join(getContextOSPath(rootPath), PROJECT_MEMORY_FILE);
  writeFileSync(path, content, 'utf-8');
}
