import { getDatabase } from '@/lib/contextos-db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function HomePage() {
  const db = await getDatabase();
  const stats = db.getStats();
  const recentActivity = db.getRecentActivity(5);
  db.close();

  const cards = [
    {
      title: 'Files Indexed',
      value: stats.filesIndexed,
      icon: 'FileText',
      color: 'text-blue-400',
    },
    {
      title: 'Decisions Learned',
      value: stats.decisionsLearned,
      icon: 'GitBranch',
      color: 'text-purple-400',
    },
    {
      title: 'Rules Extracted',
      value: stats.rulesExtracted,
      icon: 'Layers',
      color: 'text-amber-400',
    },
    {
      title: 'Last Index',
      value: formatDate(stats.lastIndexedAt),
      icon: 'Clock',
      color: 'text-primary',
      isText: true,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Repository memory overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-border/50 bg-card/60 p-6 shadow backdrop-blur-md"
          >
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <p className={`mt-2 font-bold ${card.isText ? 'text-lg' : 'text-3xl'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border/50 bg-card/60 p-6 shadow backdrop-blur-md">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No activity yet. Run <code className="text-primary">contextosai watch</code> to track
            changes.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 px-4 py-2 font-mono text-sm"
              >
                <span>
                  <span className="text-primary">{item.action}</span> {item.path}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
