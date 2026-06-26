'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity,
  GitBranch,
  Home,
  Layers,
  Search as SearchIcon,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  type DemoView,
  DEMO_ACTIVITY,
  DEMO_CONVENTIONS,
  DEMO_DECISIONS,
  DEMO_DEPS,
  DEMO_FRAMEWORKS,
  DEMO_MODULES,
  DEMO_CURSOR_EXPORT,
  DEMO_PROJECT_MEMORY,
  DEMO_SEARCH_RESULTS,
  DEMO_STATS,
  mockSearch,
} from '@/components/landing/demo-data';

const NAV: { id: DemoView; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'decisions', label: 'Decisions', icon: GitBranch },
  { id: 'activity', label: 'Activity', icon: Activity },
];

type Props = {
  defaultView?: DemoView;
  view?: DemoView;
  onViewChange?: (view: DemoView) => void;
  className?: string;
  compact?: boolean;
};

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export function InteractiveDashboard({
  defaultView = 'architecture',
  view: controlledView,
  onViewChange,
  className,
  compact = false,
}: Props) {
  const [internalView, setInternalView] = useState<DemoView>(defaultView);
  const view = controlledView ?? internalView;

  const setView = (v: DemoView) => {
    if (controlledView === undefined) setInternalView(v);
    onViewChange?.(v);
  };

  useEffect(() => {
    if (controlledView !== undefined) setInternalView(controlledView);
  }, [controlledView]);

  useEffect(() => {
    setInternalView(defaultView);
  }, [defaultView]);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-[#1E293B] bg-[#0B0F19] shadow-[0_40px_100px_-24px_rgba(0,0,0,0.85)] sm:rounded-2xl',
        compact ? 'md:h-[520px]' : 'md:h-[640px]',
        className,
      )}
    >
      {/* Mobile tab bar */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#1E293B] p-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors',
              view === id
                ? 'bg-[#10B981]/15 text-[#10B981]'
                : 'text-[#F3F4F6]/50',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="hidden w-52 shrink-0 flex-col border-r border-[#1E293B] bg-[#0B0F19]/95 md:flex">
        <div className="border-b border-[#1E293B] px-4 py-4">
          <Logo size="xs" subtitle="Local memory layer" />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                view === id
                  ? 'bg-[#10B981]/10 text-[#10B981]'
                  : 'text-[#F3F4F6]/55 hover:bg-[#1E293B] hover:text-[#F3F4F6]',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[#1E293B] p-3">
          <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/80 p-2.5 font-mono text-[10px] text-[#F3F4F6]/55">
            <div className="mb-0.5 flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-[#22C55E]" />
              <span className="text-[#F3F4F6]/80">contextosai watch</span>
            </div>
            <p className="text-[9px] text-[#F3F4F6]/40">{DEMO_STATS.filesIndexed} indexed files</p>
          </div>
          <Link
            href="/app"
            className="mt-2 block text-center text-[10px] text-[#10B981] hover:underline"
          >
            Open full dashboard →
          </Link>
        </div>
      </aside>

      <main className="min-h-[280px] min-w-0 flex-1 overflow-y-auto bg-[#0B0F19] sm:min-h-[320px]">
        <div className="sticky top-0 z-10 border-b border-[#1E293B]/60 bg-[#0B0F19]/90 px-4 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-[#F3F4F6]/35">
            <span className="md:hidden">Demo · swipe tabs to explore</span>
            <span className="hidden md:inline">Demo · interactive sample data · try the sidebar</span>
          </span>
        </div>

        <div className={compact ? 'p-4' : 'p-6'}>
          {view === 'home' && <HomeView compact={compact} />}
          {view === 'search' && <SearchView compact={compact} />}
          {view === 'architecture' && <ArchitectureView compact={compact} />}
          {view === 'decisions' && <DecisionsView compact={compact} />}
          {view === 'activity' && <ActivityView compact={compact} />}
        </div>
      </main>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-[#F3F4F6]">{title}</h1>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function HomeView({ compact }: { compact: boolean }) {
  const cards = [
    { title: 'Files Indexed', value: String(DEMO_STATS.filesIndexed) },
    { title: 'Decisions Learned', value: String(DEMO_STATS.decisionsLearned) },
    { title: 'Rules Extracted', value: String(DEMO_STATS.rulesExtracted) },
    { title: 'Last Index', value: DEMO_STATS.lastIndexed, isText: true },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Repository memory overview" />
      <div className={cn('grid gap-3', compact ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4')}>
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-border/50 bg-card/60 p-4 shadow backdrop-blur-md"
          >
            <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
            <p className={cn('mt-1 font-bold text-[#F3F4F6]', c.isText ? 'text-sm' : 'text-2xl')}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/60 p-4 shadow backdrop-blur-md">
          <h2 className="text-sm font-semibold">Rules exported to Cursor</h2>
          <div className="mt-2 flex flex-wrap gap-1">
            {DEMO_FRAMEWORKS.slice(0, 5).map((f) => (
              <Badge key={f.name} className="bg-primary/20 text-primary text-[10px]">
                {f.name}
              </Badge>
            ))}
          </div>
          <pre className="mt-3 max-h-28 overflow-auto rounded-lg border border-border/30 bg-background/50 p-2.5 font-mono text-[9px] text-muted-foreground whitespace-pre-wrap">
            {DEMO_CURSOR_EXPORT}
          </pre>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 p-4 shadow backdrop-blur-md">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <ul className="mt-3 space-y-2">
            {DEMO_ACTIVITY.slice(0, 3).map((item) => (
              <li
                key={item.path + item.time}
                className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 px-3 py-1.5 font-mono text-[11px]"
              >
                <span>
                  <span className="text-primary">{item.action}</span> {item.path}
                </span>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function SearchView({ compact }: { compact: boolean }) {
  const [query, setQuery] = useState('authentication middleware');
  const [results, setResults] = useState(DEMO_SEARCH_RESULTS);
  const [loading, setLoading] = useState(false);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const found = mockSearch(query);
      setResults(found.length > 0 ? found : DEMO_SEARCH_RESULTS.slice(0, 2));
      setLoading(false);
    }, 400);
  };

  return (
    <>
      <PageHeader title="Search" subtitle="Semantic search across indexed files" />
      <form onSubmit={runSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "authentication middleware"'
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading} className="h-8 w-full text-xs sm:w-auto">
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>
      <div className="mt-4 space-y-3">
        {results.map((r) => (
          <Card key={r.path}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="font-mono text-xs">{r.path}</CardTitle>
              <Badge className="bg-primary/20 text-primary text-[10px]">
                {pct(r.score)} match
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={cn('text-[11px] text-muted-foreground', compact ? 'line-clamp-2' : 'line-clamp-3')}>
                {r.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function ArchitectureView({ compact }: { compact: boolean }) {
  return (
    <>
      <PageHeader
        title="Architecture"
        subtitle="Frameworks, conventions, and project structure"
      />
      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'lg:grid-cols-2')}>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5 p-4 pt-0">
            {DEMO_FRAMEWORKS.slice(0, compact ? 6 : undefined).map((f) => (
              <Badge key={f.name} className="bg-primary/20 text-primary text-[10px]">
                {f.name} · {pct(f.confidence)}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Conventions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {DEMO_CONVENTIONS.map((c) => (
              <div key={c.name} className="rounded-lg border border-border/30 px-2.5 py-2 text-xs">
                <span className="font-medium">{c.name}</span>
                <p className="text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {!compact && (
          <>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Important Directories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {DEMO_MODULES.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between rounded-lg border border-border/30 px-2.5 py-2 text-xs"
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {m.description}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Top Dependencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-4 pt-0">
                {DEMO_DEPS.map(({ dep, count }) => (
                  <div key={dep} className="flex items-center justify-between text-[11px]">
                    <span className="truncate font-mono">{dep}</span>
                    <Badge className="ml-2 shrink-0 border border-border/50 text-[10px]">
                      {count} refs
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="mt-3">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Project Memory</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <pre className="max-h-32 overflow-auto rounded-lg border border-border/30 bg-background/50 p-3 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap">
            {DEMO_PROJECT_MEMORY}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}

function DecisionsView({ compact }: { compact: boolean }) {
  const items = compact ? DEMO_DECISIONS.slice(0, 2) : DEMO_DECISIONS;
  return (
    <>
      <PageHeader
        title="Decisions"
        subtitle="Architectural decisions learned from git history"
      />
      <div className="relative space-y-0">
        <div className="absolute left-4 top-0 h-full w-px bg-border" />
        {items.map((d, i) => (
          <div key={d.title} className="relative flex gap-4 pb-4">
            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background">
              <span className="text-[10px] font-bold text-primary">{items.length - i}</span>
            </div>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <div>
                  <CardTitle className="text-sm">{d.title}</CardTitle>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {d.date} · {d.source}
                  </p>
                </div>
                <Badge className="bg-primary/20 text-primary text-[10px]">
                  {pct(d.confidence)}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs">{d.decision}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}

function ActivityView({ compact }: { compact: boolean }) {
  const items = compact ? DEMO_ACTIVITY.slice(0, 4) : DEMO_ACTIVITY;
  return (
    <>
      <PageHeader title="Activity" subtitle="Recent file changes from the watcher" />
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">File Changes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="divide-y divide-border/30">
            {items.map((item) => (
              <li
                key={item.path + item.time}
                className="flex items-center justify-between py-2 font-mono text-[11px]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Badge className="shrink-0 bg-amber-500/20 text-amber-400 text-[10px]">
                    {item.action}
                  </Badge>
                  <span className="truncate">{item.path}</span>
                </div>
                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
