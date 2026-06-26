import 'server-only';

export function getProjectRoot(): string {
  return process.env.CONTEXTOS_ROOT ?? process.cwd();
}

export async function getDatabase() {
  const { ContextDatabase } = await import('@contextosai/core/database');
  return new ContextDatabase(getProjectRoot());
}
