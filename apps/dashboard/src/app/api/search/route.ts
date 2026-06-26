import { NextResponse } from 'next/server';
import { getProjectRoot, isLocalDashboardAvailable } from '@/lib/contextos-db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  if (!isLocalDashboardAvailable()) {
    return NextResponse.json(
      { error: 'Search requires a local ContextOS index. Run contextosai init && contextosai index.' },
      { status: 503 },
    );
  }

  try {
    const { searchRepository } = await import('@contextosai/core/search');
    const results = await searchRepository(getProjectRoot(), q);
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
