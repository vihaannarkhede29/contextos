import { NextResponse } from 'next/server';
import { getProjectRoot } from '@/lib/contextos-db';

export const runtime = 'nodejs';

export async function GET() {
  const { ContextDatabase } = await import('@contextosai/core/database');
  const db = new ContextDatabase(getProjectRoot());
  const stats = db.getStats();
  db.close();
  return NextResponse.json(stats);
}
