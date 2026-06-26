'use client';

import { useState } from 'react';
import {
  Search,
  GitBranch,
  Layers,
  Eye,
  Bot,
  FileCode2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  InteractiveDashboard,
} from '@/components/landing/interactive-dashboard';
import type { DemoView } from '@/components/landing/demo-data';

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  body: string;
  demoView?: DemoView;
  preview?: { label: string; rows: { k: string; v: string }[] };
};

const tabs: Tab[] = [
  {
    id: 'search',
    label: 'Semantic Search',
    icon: Search,
    title: 'Find code by meaning, not grep.',
    body: 'ContextOS embeds every indexed file with Ollama or Transformers.js. Ask "where is auth handled?" and get ranked results with relevance scores — fully offline.',
    demoView: 'search',
  },
  {
    id: 'decisions',
    label: 'Decision Memory',
    icon: GitBranch,
    title: 'Git history becomes agent knowledge.',
    body: 'Migration commits, ADR-style messages, and refactor patterns are extracted and deduplicated. Agents stop re-litigating decisions your team already made.',
    demoView: 'decisions',
  },
  {
    id: 'rules',
    label: 'Architecture Rules',
    icon: Layers,
    title: 'Conventions extracted, not guessed.',
    body: 'Framework detection, import graphs, and folder structure produce rules your agents follow — exported to Cursor automatically on every index.',
    demoView: 'architecture',
  },
  {
    id: 'watch',
    label: 'Live Watch',
    icon: Eye,
    title: 'Memory that never rots.',
    body: 'contextosai watch re-indexes on save. Vectors, rules, and agent exports refresh incrementally — your IDE context stays as current as your last commit.',
    demoView: 'activity',
  },
  {
    id: 'mcp',
    label: 'MCP Server',
    icon: Bot,
    title: 'Agents query your repo mid-chat.',
    body: 'Five stdio MCP tools plug into Cursor. Search, stats, rules, decisions, and project memory — without copy-pasting files into every prompt.',
    preview: {
      label: 'mcp tools',
      rows: [
        { k: 'search_codebase', v: 'ready' },
        { k: 'get_stats', v: 'ready' },
        { k: 'get_project_memory', v: 'ready' },
      ],
    },
  },
  {
    id: 'export',
    label: 'Agent Export',
    icon: FileCode2,
    title: 'Zero-config Cursor integration.',
    body: 'Every index writes .cursor/rules/contextos.mdc and AGENTS.md from live project state. Regenerate anytime with contextosai export.',
    preview: {
      label: 'exported files',
      rows: [
        { k: '.cursor/rules/contextos.mdc', v: '✓' },
        { k: 'AGENTS.md', v: '✓' },
        { k: '.contextos/project.md', v: '✓' },
      ],
    },
  },
];

export function WorkspaceTabs() {
  const [active, setActive] = useState(tabs[0]!.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0]!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-16">
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="mb-4 hidden text-xs font-medium uppercase tracking-widest text-[#10B981] lg:block">
          Platform
        </p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-xs transition sm:gap-3 sm:px-4 sm:py-3.5 sm:text-sm lg:w-full',
              active === tab.id
                ? 'bg-[#1E293B] text-[#F3F4F6]'
                : 'border border-[#1E293B]/60 text-[#F3F4F6]/45 hover:bg-[#1E293B]/40 hover:text-[#F3F4F6]/80 lg:border-transparent',
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0 text-[#10B981]" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#141b2d]/80 p-4 sm:rounded-2xl sm:p-6 md:p-8">
        <h3 className="font-serif text-xl text-[#F3F4F6] sm:text-2xl">{current.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-[#F3F4F6]/55">{current.body}</p>

        {current.demoView ? (
          <div className="mt-8">
            <InteractiveDashboard
              compact
              view={current.demoView}
              defaultView={current.demoView}
            />
          </div>
        ) : current.preview ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-[#0B0F19]/60 bg-[#0B0F19]/60">
            <div className="border-b border-[#0B0F19]/50 px-4 py-2.5 font-mono text-[10px] text-[#22C55E]">
              {current.preview.label}
            </div>
            <div className="divide-y divide-[#1E293B]/40">
              {current.preview.rows.map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between px-4 py-3 font-mono text-xs"
                >
                  <span className="truncate text-[#F3F4F6]/60">{row.k}</span>
                  <span className="ml-4 shrink-0 text-[#10B981]">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
