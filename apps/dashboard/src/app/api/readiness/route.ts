import { NextResponse } from 'next/server';
import { analyzeGitHubRepo, parseGitHubUrl } from '@/lib/github-readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    if (!parseGitHubUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Use https://github.com/owner/repo or owner/repo' },
        { status: 400 },
      );
    }

    const result = await analyzeGitHubRepo(url);
    return NextResponse.json({
      owner: result.ref.owner,
      repo: result.ref.repo,
      branch: result.branch,
      fileCount: result.fileCount,
      report: result.report,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
