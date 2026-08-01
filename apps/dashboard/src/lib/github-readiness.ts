import {
  scoreRepoSnapshot,
  type ReadinessReport,
  type RepoSnapshot,
} from '@contextosai/shared';

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
  '.github/dependabot.yml',
  '.github/dependabot.yaml',
  'renovate.json',
];

export type GitHubRepoRef = {
  owner: string;
  repo: string;
};

export function parseGitHubUrl(input: string): GitHubRepoRef | null {
  const trimmed = input.trim().replace(/\/$/, '');
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i,
    /^github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i,
    /^([^/]+)\/([^/]+)$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) {
      return { owner: m[1], repo: m[2].replace(/\.git$/i, '') };
    }
  }
  return null;
}

async function ghJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'contextosai-readiness',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 404) {
      throw new Error('Repository not found. Make sure it is public.');
    }
    if (res.status === 403) {
      throw new Error('GitHub rate limit hit. Try again in a few minutes.');
    }
    throw new Error(`GitHub API error (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function fetchRaw(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'contextosai-readiness' },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.text();
}

type TreeEntry = { path: string; type: string };

export async function analyzeGitHubRepo(
  input: string,
  options?: { token?: string },
): Promise<{ report: ReadinessReport; ref: GitHubRepoRef; branch: string; fileCount: number }> {
  const ref = parseGitHubUrl(input);
  if (!ref) {
    throw new Error('Invalid GitHub URL. Use https://github.com/owner/repo or owner/repo');
  }

  const token = options?.token ?? process.env.GITHUB_TOKEN;

  const repoMeta = await ghJson<{ default_branch: string }>(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}`,
    token,
  );
  const branch = repoMeta.default_branch || 'main';

  const tree = await ghJson<{ tree: TreeEntry[]; truncated: boolean }>(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}/git/trees/${branch}?recursive=1`,
    token,
  );

  const paths = tree.tree.filter((t) => t.type === 'blob').map((t) => t.path);

  // Always try key files + any workflow ymls (cap)
  const workflows = paths
    .filter((p) => /^\.github\/workflows\/.+\.(yml|yaml)$/i.test(p))
    .slice(0, 5);
  const cursorRules = paths
    .filter((p) => p.startsWith('.cursor/rules/') && p.endsWith('.mdc'))
    .slice(0, 5);

  const toFetch = [...new Set([...KEY_FILES, ...workflows, ...cursorRules])].filter((p) =>
    paths.some((x) => x.toLowerCase() === p.toLowerCase() || x === p),
  );

  // Map actual path casing from tree
  const pathLookup = new Map(paths.map((p) => [p.toLowerCase(), p]));
  const resolved = toFetch
    .map((p) => pathLookup.get(p.toLowerCase()) ?? (paths.includes(p) ? p : null))
    .filter((p): p is string => !!p);

  const contents: Record<string, string> = {};
  await Promise.all(
    resolved.map(async (p) => {
      const text = await fetchRaw(ref.owner, ref.repo, branch, p);
      if (text != null) contents[p] = text;
    }),
  );

  const snapshot: RepoSnapshot = {
    paths,
    contents,
    remote: true,
    agentExportEnabled: true,
    stats: {
      filesIndexed: paths.length,
      rulesExtracted: 0,
      decisionsLearned: 0,
      lastIndexedAt: new Date().toISOString(),
    },
  };

  const report = scoreRepoSnapshot(snapshot);
  return { report, ref, branch, fileCount: paths.length };
}
