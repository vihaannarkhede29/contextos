import { LocalDashboardPrompt } from '@/components/local-dashboard-prompt';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tryGetDatabase } from '@/lib/contextos-db';
import { readProjectMemory } from '@/lib/contextos-memory';
import { formatPercent } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ArchitecturePage() {
  const db = await tryGetDatabase();
  if (!db) return <LocalDashboardPrompt />;

  const rules = db.getRules();
  const files = db.getAllFiles();
  db.close();

  const frameworks = rules.filter((r) => r.category === 'framework');
  const conventions = rules.filter((r) => r.category === 'convention');
  const modules = rules.filter((r) => r.category === 'module');

  const importGraph = new Map<string, number>();
  for (const file of files) {
    for (const imp of file.imports) {
      importGraph.set(imp, (importGraph.get(imp) ?? 0) + 1);
    }
  }
  const topDeps = [...importGraph.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const projectMemory = readProjectMemory();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Architecture</h1>
        <p className="mt-1 text-muted-foreground">Frameworks, conventions, and project structure</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {frameworks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No frameworks detected yet.</p>
            ) : (
              frameworks.map((f) => (
                <Badge key={f.id} className="bg-primary/20 text-primary">
                  {f.name} · {formatPercent(f.confidence)}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conventions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conventions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conventions detected yet.</p>
            ) : (
              conventions.map((c) => (
                <div key={c.id} className="rounded-lg border border-border/30 px-3 py-2 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <p className="text-muted-foreground">{c.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Directories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules detected yet.</p>
            ) : (
              modules.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{m.description}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            {topDeps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No imports indexed yet.</p>
            ) : (
              <div className="space-y-2">
                {topDeps.map(([dep, count]) => (
                  <div key={dep} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{dep}</span>
                    <Badge className="border border-border/50">{count} refs</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Project Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg border border-border/30 bg-background/50 p-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
            {projectMemory}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
