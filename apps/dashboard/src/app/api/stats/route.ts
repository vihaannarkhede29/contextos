import { NextResponse } from 'next/server';
import { isLocalDashboardAvailable, tryGetDatabase } from '@/lib/contextos-db';

export const runtime = 'nodejs';

export async function GET() {
  if (!isLocalDashboardAvailable()) {
    return NextResponse.json(
      { error: 'Dashboard requires a local ContextOS index. Run contextosai init && contextosai index.' },
      { status: 503 },
    );
  }

  const db = await tryGetDatabase();
  if (!db) {
    return NextResponse.json({ error: 'Could not open local index.' }, { status: 503 });
  }

  const stats = db.getStats();
  db.close();
  return NextResponse.json(stats);
}
