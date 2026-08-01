import type {
  ReadinessCheck,
  ReadinessDimension,
  ReadinessDimensionId,
  ReadinessGrade,
  ReadinessNextStep,
  ReadinessReport,
} from './schemas.js';

export type ReadinessRuleHint = {
  category: 'framework' | 'convention' | 'module' | 'dependency';
  name: string;
};

export type ReadinessFileHint = {
  path: string;
  imports?: string[];
  comments?: string[];
  summary?: string;
};

/** Virtual repo view for local or remote (GitHub) scoring. */
export type RepoSnapshot = {
  paths: string[];
  /** Key file contents (package.json, configs, README, etc.) */
  contents: Record<string, string>;
  stats?: {
    filesIndexed: number;
    rulesExtracted: number;
    decisionsLearned: number;
    lastIndexedAt: string | null;
  };
  rules?: ReadinessRuleHint[];
  files?: ReadinessFileHint[];
  agentExportEnabled?: boolean;
  /** When true, Agent Memory treats tree scan as a stand-in for local index */
  remote?: boolean;
};

const WEIGHTS: Record<ReadinessDimensionId, number> = {
  agent_memory: 0.25,
  testing: 0.2,
  docs: 0.2,
  build: 0.15,
  code_quality: 0.12,
  security: 0.08,
};

const DIMENSION_NAMES: Record<ReadinessDimensionId, string> = {
  agent_memory: 'Agent Memory',
  docs: 'Docs',
  testing: 'Testing',
  build: 'Build',
  code_quality: 'Code Quality',
  security: 'Security',
};

type CheckResult = {
  check: ReadinessCheck;
  nextStep?: Omit<ReadinessNextStep, 'dimensionId'>;
};

function scoreToGrade(score: number): ReadinessGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function overallToLevel(score: number): { level: number; label: string } {
  if (score >= 85) return { level: 5, label: 'Optimized' };
  if (score >= 70) return { level: 4, label: 'Agent-ready' };
  if (score >= 55) return { level: 3, label: 'Agent-ready' };
  if (score >= 40) return { level: 2, label: 'Needs work' };
  return { level: 1, label: 'Not ready' };
}

function buildDimension(id: ReadinessDimensionId, results: CheckResult[]): ReadinessDimension {
  const checks = results.map((r) => r.check);
  const passed = checks.filter((c) => c.passed).length;
  const score = checks.length === 0 ? 0 : Math.round((passed / checks.length) * 100);
  const nextSteps: ReadinessNextStep[] = results
    .filter((r) => !r.check.passed && r.nextStep)
    .map((r) => ({
      ...r.nextStep!,
      dimensionId: id,
    }));

  return {
    id,
    name: DIMENSION_NAMES[id],
    score,
    grade: scoreToGrade(score),
    checks,
    nextSteps,
  };
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function pathSet(paths: string[]): Set<string> {
  return new Set(paths.map(normalizePath));
}

function hasPath(paths: Set<string>, relative: string): boolean {
  const n = normalizePath(relative);
  if (paths.has(n)) return true;
  // case-insensitive for README
  const lower = n.toLowerCase();
  for (const p of paths) {
    if (p.toLowerCase() === lower) return true;
  }
  return false;
}

function hasAnyPath(paths: Set<string>, candidates: string[]): boolean {
  return candidates.some((c) => hasPath(paths, c));
}

function content(contents: Record<string, string>, relative: string): string | null {
  const n = normalizePath(relative);
  if (contents[n] != null) return contents[n];
  const found = Object.keys(contents).find((k) => k.toLowerCase() === n.toLowerCase());
  return found != null ? (contents[found] ?? null) : null;
}

function parseJson(contents: Record<string, string>, relative: string): Record<string, unknown> | null {
  const raw = content(contents, relative);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTestFile(path: string): boolean {
  return /\.(test|spec)\.[^.]+$/i.test(path) || /\/__tests__\//i.test(path);
}

function isDocFile(path: string): boolean {
  return /\.(md|mdx)$/i.test(path);
}

function isSourceFile(path: string): boolean {
  return /\.(ts|tsx|js|jsx|py|go|java)$/i.test(path) && !isTestFile(path);
}

function collectDeps(pkg: Record<string, unknown> | null): Set<string> {
  const deps = new Set<string>();
  if (!pkg) return deps;
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const block = pkg[key];
    if (block && typeof block === 'object') {
      for (const name of Object.keys(block as Record<string, string>)) {
        deps.add(name.toLowerCase());
      }
    }
  }
  return deps;
}

function inferRulesFromSnapshot(
  paths: Set<string>,
  deps: Set<string>,
  existing?: ReadinessRuleHint[],
): ReadinessRuleHint[] {
  if (existing && existing.length > 0) return existing;
  const rules: ReadinessRuleHint[] = [];
  if (deps.has('vitest') || deps.has('jest') || deps.has('@playwright/test')) {
    rules.push({
      category: 'framework',
      name: deps.has('vitest') ? 'Vitest' : deps.has('jest') ? 'Jest' : 'Playwright',
    });
  }
  if (deps.has('next')) rules.push({ category: 'framework', name: 'Next.js' });
  if (deps.has('react')) rules.push({ category: 'framework', name: 'React' });
  if ([...paths].some(isTestFile)) {
    rules.push({ category: 'convention', name: 'Colocated Tests' });
  }
  return rules;
}

function listWorkflows(paths: Set<string>): string[] {
  return [...paths].filter((p) => /^\.github\/workflows\/.+\.(yml|yaml)$/i.test(p));
}

function scoreAgentMemory(snapshot: RepoSnapshot, paths: Set<string>): CheckResult[] {
  const remote = snapshot.remote === true;
  const stats = snapshot.stats ?? {
    filesIndexed: 0,
    rulesExtracted: 0,
    decisionsLearned: 0,
    lastIndexedAt: null,
  };
  const hasAgents = hasPath(paths, 'AGENTS.md');
  const hasCursorRule =
    hasPath(paths, '.cursor/rules/contextos.mdc') ||
    [...paths].some((p) => p.startsWith('.cursor/rules/') && p.endsWith('.mdc'));
  const hasProjectMemory = hasPath(paths, '.contextos/project.md');
  const hasContextos = [...paths].some((p) => p.startsWith('.contextos/'));
  const exportEnabled = snapshot.agentExportEnabled !== false;

  const indexed = remote
    ? paths.size > 0
    : stats.filesIndexed > 0;
  const fresh = remote
    ? true
    : !!stats.lastIndexedAt &&
      Date.now() - new Date(stats.lastIndexedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const rulesCount = snapshot.rules?.length ?? stats.rulesExtracted;
  const decisionsCount = stats.decisionsLearned;

  return [
    {
      check: {
        id: 'index_exists',
        label: remote ? 'Repository tree scanned' : 'Repository is indexed',
        passed: indexed,
        detail: remote ? `${paths.size} files in tree` : `${stats.filesIndexed} files`,
      },
      nextStep: indexed
        ? undefined
        : {
            id: 'run_index',
            title: 'Index the repository',
            detail: 'Run `contextosai index` so agents have searchable memory.',
          },
    },
    {
      check: {
        id: 'index_fresh',
        label: remote ? 'Public tree available' : 'Index is fresh (≤7 days)',
        passed: fresh,
        detail: remote ? 'GitHub snapshot' : (stats.lastIndexedAt ?? 'Never indexed'),
      },
      nextStep: fresh
        ? undefined
        : {
            id: 'reindex',
            title: 'Re-index for freshness',
            detail: 'Run `contextosai index` or `contextosai watch` to keep memory current.',
          },
    },
    {
      check: { id: 'agents_md', label: 'AGENTS.md present', passed: hasAgents },
      nextStep: hasAgents
        ? undefined
        : {
            id: 'export_agents',
            title: 'Add AGENTS.md',
            detail: remote
              ? 'Run `contextosai init && contextosai index` locally to auto-export AGENTS.md.'
              : 'Run `contextosai export` (or enable agent export and re-index).',
          },
    },
    {
      check: {
        id: 'cursor_rules',
        label: '.cursor/rules present',
        passed: hasCursorRule,
      },
      nextStep: hasCursorRule
        ? undefined
        : {
            id: 'export_cursor',
            title: 'Add Cursor rules',
            detail: remote
              ? 'ContextOS exports `.cursor/rules/contextos.mdc` on index.'
              : 'Run `contextosai export` to generate always-apply Cursor rules.',
          },
    },
    {
      check: {
        id: 'agent_export_enabled',
        label: remote ? 'Agent memory tooling available' : 'Agent export enabled',
        passed: remote ? true : exportEnabled,
        detail: remote ? 'Install ContextOS locally for full memory' : undefined,
      },
      nextStep:
        !remote && !exportEnabled
          ? {
              id: 'enable_export',
              title: 'Enable agent export',
              detail: 'Set agentExportEnabled: true in .contextos/config.json',
            }
          : undefined,
    },
    {
      check: {
        id: 'project_memory',
        label: '.contextos/project.md exists',
        passed: hasProjectMemory || (remote && hasContextos),
      },
      nextStep:
        hasProjectMemory || (remote && hasContextos)
          ? undefined
          : {
              id: 'project_memory',
              title: remote ? 'Initialize ContextOS locally' : 'Generate project memory',
              detail: remote
                ? 'Clone the repo and run `contextosai init && contextosai index`.'
                : 'Run `contextosai index` to write .contextos/project.md',
            },
    },
    {
      check: {
        id: 'rules_extracted',
        label: 'Architecture signals detected',
        passed: rulesCount >= 1,
        detail: `${rulesCount} rule(s)`,
      },
      nextStep:
        rulesCount >= 1
          ? undefined
          : {
              id: 'need_rules',
              title: 'Extract architecture rules',
              detail: 'Index with ContextOS or add detectable frameworks to package.json.',
            },
    },
    {
      check: {
        id: 'decisions_learned',
        label: remote ? 'Local ContextOS decisions (clone to unlock)' : 'Git decisions learned',
        passed: remote ? false : decisionsCount >= 1,
        detail: remote ? 'Requires local index' : `${decisionsCount} decisions`,
      },
      nextStep:
        !remote && decisionsCount >= 1
          ? undefined
          : {
              id: 'need_decisions',
              title: 'Capture architectural decisions',
              detail: remote
                ? 'Run ContextOS locally to learn decisions from git history.'
                : 'Use migration/adoption-style commit messages, then re-index.',
            },
    },
  ];
}

function scoreDocs(paths: Set<string>, files: ReadinessFileHint[]): CheckResult[] {
  const mdCount = files.length
    ? files.filter((f) => isDocFile(f.path)).length
    : [...paths].filter(isDocFile).length;
  const hasReadme = hasAnyPath(paths, ['README.md', 'README.mdx', 'readme.md']);
  const hasContributing = hasAnyPath(paths, ['CONTRIBUTING.md', 'CONTRIBUTING.mdx']);
  const hasDocsDir =
    [...paths].some((p) => p.startsWith('docs/') || p.startsWith('apps/docs/')) ||
    hasPath(paths, 'docs') ||
    hasPath(paths, 'apps/docs');

  return [
    {
      check: { id: 'readme', label: 'README present', passed: hasReadme },
      nextStep: hasReadme
        ? undefined
        : {
            id: 'add_readme',
            title: 'Add a README',
            detail: 'Create README.md with setup and architecture overview for agents.',
          },
    },
    {
      check: {
        id: 'markdown_count',
        label: 'Markdown docs (≥2)',
        passed: mdCount >= 2,
        detail: `${mdCount} markdown files`,
      },
      nextStep:
        mdCount >= 2
          ? undefined
          : {
              id: 'more_docs',
              title: 'Add more documentation',
              detail: 'Add architecture or guide markdown files agents can retrieve.',
            },
    },
    {
      check: {
        id: 'docs_dir',
        label: 'docs/ or apps/docs present',
        passed: hasDocsDir,
      },
      nextStep: hasDocsDir
        ? undefined
        : {
            id: 'docs_folder',
            title: 'Add a docs folder',
            detail: 'Create docs/ with agent-oriented guides and conventions.',
          },
    },
    {
      check: {
        id: 'contributing',
        label: 'CONTRIBUTING.md present',
        passed: hasContributing,
      },
      nextStep: hasContributing
        ? undefined
        : {
            id: 'add_contributing',
            title: 'Add CONTRIBUTING.md',
            detail: 'Document how agents and humans should change the codebase.',
          },
    },
  ];
}

function scoreTesting(
  paths: Set<string>,
  files: ReadinessFileHint[],
  rules: ReadinessRuleHint[],
): CheckResult[] {
  const pathList = files.length ? files.map((f) => f.path) : [...paths];
  const tests = pathList.filter(isTestFile);
  const sources = pathList.filter(isSourceFile);
  const ratio = sources.length === 0 ? 0 : tests.length / sources.length;
  const hasVitest = rules.some((r) => r.name === 'Vitest');
  const hasColocated = rules.some((r) => r.name === 'Colocated Tests');
  const hasPytest = pathList.some((f) => /test_.*\.py$|.*_test\.py$/i.test(f));
  const runnerDetected =
    hasVitest ||
    hasPytest ||
    rules.some((r) => /jest|playwright|pytest/i.test(r.name)) ||
    files.some((f) =>
      (f.imports ?? []).some(
        (i) =>
          /['"]vitest['"]/.test(i) ||
          /['"]@jest\//.test(i) ||
          /['"]jest['"]/.test(i) ||
          /['"]@playwright\//.test(i),
      ),
    );

  return [
    {
      check: {
        id: 'has_tests',
        label: 'Test files present',
        passed: tests.length > 0,
        detail: `${tests.length} test files`,
      },
      nextStep:
        tests.length > 0
          ? undefined
          : {
              id: 'add_tests',
              title: 'Add tests',
              detail: 'Add colocated *.test.ts / *.spec.ts (or pytest) files.',
            },
    },
    {
      check: {
        id: 'test_ratio',
        label: 'Test:source ratio ≥ 15%',
        passed: ratio >= 0.15,
        detail: sources.length
          ? `${tests.length}/${sources.length} (${Math.round(ratio * 100)}%)`
          : 'No source files',
      },
      nextStep:
        ratio >= 0.15
          ? undefined
          : {
              id: 'raise_ratio',
              title: 'Raise test:source ratio',
              detail: `Currently ${tests.length}/${sources.length || 0}. Aim for ≥15% colocated tests.`,
            },
    },
    {
      check: {
        id: 'test_runner',
        label: 'Test runner detected',
        passed: runnerDetected,
      },
      nextStep: runnerDetected
        ? undefined
        : {
            id: 'add_runner',
            title: 'Add a test runner',
            detail: 'Install Vitest, Jest, Playwright, or pytest and write a first test.',
          },
    },
    {
      check: {
        id: 'colocated_tests',
        label: 'Colocated tests convention',
        passed:
          hasColocated || (tests.length > 0 && tests.some((t) => !t.includes('__tests__'))),
      },
      nextStep:
        hasColocated || tests.length > 0
          ? undefined
          : {
              id: 'colocate',
              title: 'Colocate tests with source',
              detail: 'Place *.test.ts next to the modules they cover.',
            },
    },
  ];
}

function scoreBuild(
  paths: Set<string>,
  pkg: Record<string, unknown> | null,
): CheckResult[] {
  const scripts = (pkg?.scripts ?? {}) as Record<string, string>;
  const hasBuild = !!scripts.build;
  const hasTest = !!scripts.test;
  const hasLint = !!scripts.lint;
  const hasLockfile = hasAnyPath(paths, [
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'bun.lockb',
    'poetry.lock',
    'Cargo.lock',
    'go.sum',
  ]);
  const workflows = listWorkflows(paths);
  const hasCi = workflows.length > 0;

  return [
    {
      check: {
        id: 'build_script',
        label: 'package.json build script',
        passed: !pkg || hasBuild,
        detail: pkg ? (hasBuild ? 'build ✓' : 'missing') : 'N/A (non-JS)',
      },
      nextStep:
        pkg && !hasBuild
          ? {
              id: 'add_build',
              title: 'Add a build script',
              detail: 'Define "build" in package.json scripts.',
            }
          : undefined,
    },
    {
      check: {
        id: 'test_script',
        label: 'package.json test script',
        passed: !pkg || hasTest,
      },
      nextStep:
        pkg && !hasTest
          ? {
              id: 'add_test_script',
              title: 'Add a test script',
              detail: 'Define "test" in package.json for CI and agents.',
            }
          : undefined,
    },
    {
      check: {
        id: 'lint_script',
        label: 'package.json lint script',
        passed: !pkg || hasLint,
      },
      nextStep:
        pkg && !hasLint
          ? {
              id: 'add_lint',
              title: 'Add a lint script',
              detail: 'Define "lint" in package.json scripts.',
            }
          : undefined,
    },
    {
      check: { id: 'lockfile', label: 'Lockfile present', passed: hasLockfile },
      nextStep: hasLockfile
        ? undefined
        : {
            id: 'add_lockfile',
            title: 'Commit a lockfile',
            detail: 'Commit pnpm-lock.yaml / package-lock.json for reproducible installs.',
          },
    },
    {
      check: {
        id: 'ci',
        label: 'CI workflows (.github/workflows)',
        passed: hasCi,
        detail: hasCi ? `${workflows.length} workflow(s)` : undefined,
      },
      nextStep: hasCi
        ? undefined
        : {
            id: 'add_ci',
            title: 'Add CI workflow',
            detail: 'Add a workflow under .github/workflows/ for build/test.',
          },
    },
  ];
}

function scoreCodeQuality(
  paths: Set<string>,
  contents: Record<string, string>,
  files: ReadinessFileHint[],
  rules: ReadinessRuleHint[],
  deps: Set<string>,
): CheckResult[] {
  const hasEslint =
    hasAnyPath(paths, [
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.cjs',
      'eslint.config.ts',
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yml',
    ]) || deps.has('eslint');
  const hasPrettier =
    hasAnyPath(paths, [
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.prettierrc.json',
      'prettier.config.js',
      'prettier.config.cjs',
      'prettier.config.mjs',
    ]) || deps.has('prettier');
  const hasBiome = hasAnyPath(paths, ['biome.json', 'biome.jsonc']) || deps.has('@biomejs/biome');
  const tsconfig = parseJson(contents, 'tsconfig.json');
  const strict =
    !!tsconfig &&
    typeof tsconfig.compilerOptions === 'object' &&
    !!(tsconfig.compilerOptions as Record<string, unknown>).strict;
  const frameworks = rules.filter((r) => r.category === 'framework').length;
  const conventions = rules.filter((r) => r.category === 'convention').length;
  const withComments = files.filter(
    (f) => (f.comments?.length ?? 0) > 0 || (f.summary && f.summary.length > 20),
  );
  const commentRatio =
    files.length === 0 ? (hasPath(paths, 'README.md') ? 0.3 : 0) : withComments.length / files.length;

  return [
    {
      check: {
        id: 'linter',
        label: 'Linter configured (ESLint/Biome)',
        passed: hasEslint || hasBiome,
      },
      nextStep:
        hasEslint || hasBiome
          ? undefined
          : {
              id: 'add_linter',
              title: 'Add a linter',
              detail: 'Configure ESLint or Biome so agents follow project style.',
            },
    },
    {
      check: {
        id: 'formatter',
        label: 'Formatter configured (Prettier/Biome)',
        passed: hasPrettier || hasBiome,
      },
      nextStep:
        hasPrettier || hasBiome
          ? undefined
          : {
              id: 'add_formatter',
              title: 'Add a formatter',
              detail: 'Add Prettier or Biome for consistent formatting.',
            },
    },
    {
      check: {
        id: 'ts_strict',
        label: 'TypeScript strict mode',
        passed: !tsconfig || strict,
        detail: tsconfig ? (strict ? 'strict: true' : 'strict not enabled') : 'No tsconfig',
      },
      nextStep:
        tsconfig && !strict
          ? {
              id: 'enable_strict',
              title: 'Enable TypeScript strict mode',
              detail: 'Set "strict": true in tsconfig.json compilerOptions.',
            }
          : undefined,
    },
    {
      check: {
        id: 'frameworks',
        label: 'Frameworks detected',
        passed: frameworks >= 1,
        detail: `${frameworks} framework rule(s)`,
      },
      nextStep:
        frameworks >= 1
          ? undefined
          : {
              id: 'detect_fw',
              title: 'Make frameworks detectable',
              detail: 'Ensure package.json deps are present, then re-index.',
            },
    },
    {
      check: {
        id: 'conventions',
        label: 'Conventions detected',
        passed: conventions >= 1,
        detail: `${conventions} convention(s)`,
      },
    },
    {
      check: {
        id: 'comment_coverage',
        label: 'Docs/comments signal ≥25%',
        passed: commentRatio >= 0.25,
        detail: `${Math.round(commentRatio * 100)}%`,
      },
    },
  ];
}

function scoreSecurity(paths: Set<string>): CheckResult[] {
  const hasEnvExample = hasAnyPath(paths, ['.env.example', '.env.sample', '.env.template']);
  const hasCommittedEnv = hasAnyPath(paths, ['.env', '.env.production']);
  const hasDependabot = hasAnyPath(paths, ['.github/dependabot.yml', '.github/dependabot.yaml']);
  const hasRenovate = hasAnyPath(paths, ['renovate.json', '.github/renovate.json', 'renovate.json5']);
  const hasSecurityMd = hasAnyPath(paths, ['SECURITY.md', 'docs/SECURITY.md']);

  return [
    {
      check: {
        id: 'env_example',
        label: '.env.example present',
        passed: hasEnvExample,
      },
      nextStep: hasEnvExample
        ? undefined
        : {
            id: 'add_env_example',
            title: 'Add .env.example',
            detail: 'Document required env vars without committing secrets.',
          },
    },
    {
      check: {
        id: 'no_committed_env',
        label: 'No committed .env secrets file',
        passed: !hasCommittedEnv,
        detail: hasCommittedEnv ? 'Found .env in tree' : 'OK',
      },
      nextStep: hasCommittedEnv
        ? {
            id: 'remove_env',
            title: 'Remove committed .env',
            detail: 'Delete .env from the repo and rely on .env.example + secrets manager.',
          }
        : undefined,
    },
    {
      check: {
        id: 'dependabot',
        label: 'Dependabot or Renovate',
        passed: hasDependabot || hasRenovate,
      },
      nextStep:
        hasDependabot || hasRenovate
          ? undefined
          : {
              id: 'add_dependabot',
              title: 'Enable dependency updates',
              detail: 'Add Dependabot or Renovate for automated security patches.',
            },
    },
    {
      check: {
        id: 'security_md',
        label: 'SECURITY.md present',
        passed: hasSecurityMd,
      },
      nextStep: hasSecurityMd
        ? undefined
        : {
            id: 'add_security_md',
            title: 'Add SECURITY.md',
            detail: 'Document how to report vulnerabilities.',
          },
    },
  ];
}

/** Score a local or remote repository snapshot (no native deps). */
export function scoreRepoSnapshot(snapshot: RepoSnapshot): ReadinessReport {
  const paths = pathSet(snapshot.paths);
  const pkg = parseJson(snapshot.contents, 'package.json');
  const deps = collectDeps(pkg);
  const rules = inferRulesFromSnapshot(paths, deps, snapshot.rules);
  const files: ReadinessFileHint[] =
    snapshot.files && snapshot.files.length > 0
      ? snapshot.files
      : [...paths]
          .filter((p) => isSourceFile(p) || isTestFile(p) || isDocFile(p))
          .map((path) => ({ path }));

  const dimensions: ReadinessDimension[] = [
    buildDimension('agent_memory', scoreAgentMemory(snapshot, paths)),
    buildDimension('docs', scoreDocs(paths, files)),
    buildDimension('testing', scoreTesting(paths, files, rules)),
    buildDimension('build', scoreBuild(paths, pkg)),
    buildDimension('code_quality', scoreCodeQuality(paths, snapshot.contents, files, rules, deps)),
    buildDimension('security', scoreSecurity(paths)),
  ];

  let weighted = 0;
  for (const dim of dimensions) {
    weighted += dim.score * WEIGHTS[dim.id];
  }
  const overallScore = Math.round(weighted);
  const { level, label } = overallToLevel(overallScore);

  const allChecks = dimensions.flatMap((d) => d.checks);
  const passedCount = allChecks.filter((c) => c.passed).length;
  const percentChecksPassed =
    allChecks.length === 0 ? 0 : Math.round((passedCount / allChecks.length) * 100);

  const strengths = dimensions
    .filter((d) => d.grade === 'A' || d.grade === 'B')
    .sort((a, b) => b.score - a.score)
    .map((d) => d.name)
    .slice(0, 3);

  const nextSteps = dimensions.flatMap((d) => d.nextSteps).slice(0, 8);

  return {
    overallScore,
    level,
    label,
    percentChecksPassed,
    scannedAt: new Date().toISOString(),
    dimensions,
    strengths,
    nextSteps,
  };
}
