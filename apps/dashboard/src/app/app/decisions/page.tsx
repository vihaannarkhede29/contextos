import { LocalDashboardPrompt } from '@/components/local-dashboard-prompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tryGetDatabase } from '@/lib/contextos-db';
import { formatDate, formatPercent } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DecisionsPage() {
  const db = await tryGetDatabase();
  if (!db) return <LocalDashboardPrompt />;

  const decisions = db.getDecisions();
  db.close();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Decisions</h1>
        <p className="mt-1 text-muted-foreground">
          Architectural decisions learned from git history
        </p>
      </div>

      {decisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No decisions learned yet. Index a git repository to extract decision patterns.
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-6 top-0 h-full w-px bg-border" />
          {decisions.map((decision, i) => (
            <div key={decision.id} className="relative flex gap-6 pb-8">
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background">
                <span className="text-xs font-bold text-primary">{decisions.length - i}</span>
              </div>
              <Card className="flex-1">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{decision.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(decision.createdAt)} · {decision.source}
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    {formatPercent(decision.confidence)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{decision.decision}</p>
                  {decision.commitHash && (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      commit {decision.commitHash.slice(0, 8)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
