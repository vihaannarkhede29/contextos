import { createHash } from 'node:crypto';
import { simpleGit } from 'simple-git';
import type { DecisionRecord } from '@contextos/shared';
import { hashContent } from './config.js';

const MIGRATION_PATTERNS: Array<{
  pattern: RegExp;
  title: string;
  decision: (match: RegExpMatchArray) => string;
  confidence: number;
}> = [
  {
    pattern: /migrate\s+(?:from\s+)?redux\s+(?:to|->)\s+zustand/i,
    title: 'State Management Migration',
    decision: () => 'Use Zustand for all new state management.',
    confidence: 0.92,
  },
  {
    pattern: /replace\s+jwt\s+with\s+clerk/i,
    title: 'Authentication Migration',
    decision: () => 'Use Clerk for authentication instead of JWT.',
    confidence: 0.9,
  },
  {
    pattern: /remove\s+firebase\s+auth/i,
    title: 'Auth Provider Change',
    decision: () => 'Firebase Auth has been removed from the project.',
    confidence: 0.88,
  },
  {
    pattern: /switch(?:ed)?\s+(?:from\s+)?(?:express|fastify)\s+(?:to|->)\s+(?:fastify|express)/i,
    title: 'HTTP Framework Change',
    decision: (m) => `Framework change detected: ${m[0]}`,
    confidence: 0.85,
  },
  {
    pattern: /adopt(?:ed)?\s+(?:prisma|drizzle|typeorm)/i,
    title: 'ORM Adoption',
    decision: (m) => `Database ORM decision: ${m[0]}`,
    confidence: 0.87,
  },
  {
    pattern: /migrate\s+(?:to|->)\s+(?:next\.?js|nextjs)/i,
    title: 'Framework Migration',
    decision: () => 'Project migrated to Next.js.',
    confidence: 0.9,
  },
  {
    pattern: /(?:add|introduce|implement)(?:ed)?\s+(?:server\s+actions|rsc|react\s+server\s+components)/i,
    title: 'Server Components Adoption',
    decision: () => 'Use React Server Components and server actions.',
    confidence: 0.86,
  },
  {
    pattern: /deprecat(?:e|ed|ing)\s+(\w+)/i,
    title: 'Deprecation',
    decision: (m) => `Deprecated: ${m[1]}`,
    confidence: 0.8,
  },
];

function stableDecisionId(title: string, decision: string, commitHash: string): string {
  return createHash('sha256').update(`${commitHash}:${title}:${decision}`).digest('hex').slice(0, 32);
}

export async function extractDecisionsFromGit(rootPath: string): Promise<DecisionRecord[]> {
  const git = simpleGit(rootPath);
  const isRepo = await git.checkIsRepo();
  if (!isRepo) return [];

  const log = await git.log({ maxCount: 200 });
  const decisions: DecisionRecord[] = [];
  const seen = new Set<string>();

  for (const commit of log.all) {
    const message = commit.body ? `${commit.message}\n${commit.body}` : commit.message;
    for (const { pattern, title, decision, confidence } of MIGRATION_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        const decisionText = decision(match);
        const key = `${commit.hash}:${title}:${decisionText}`;
        if (seen.has(key)) continue;
        seen.add(key);
        decisions.push({
          id: stableDecisionId(title, decisionText, commit.hash),
          title,
          decision: decisionText,
          source: 'git commit',
          confidence,
          commitHash: commit.hash,
          createdAt: commit.date,
        });
      }
    }
  }

  return decisions;
}
