import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDatabase } from '@/lib/contextos-db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const actionColors: Record<string, string> = {
  created: 'bg-green-500/20 text-green-400',
  modified: 'bg-amber-500/20 text-amber-400',
  deleted: 'bg-red-500/20 text-red-400',
};

export default async function ActivityPage() {
  const db = await getDatabase();
  const activity = db.getRecentActivity(100);
  db.close();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="mt-1 text-muted-foreground">Recent file changes from the watcher</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No activity recorded. Run <code className="text-primary">contextos watch</code> to
              track file changes.
            </p>
          ) : (
            <ul className="divide-y divide-border/30">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3 font-mono text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={actionColors[item.action] ?? ''}>{item.action}</Badge>
                    <span>{item.path}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
