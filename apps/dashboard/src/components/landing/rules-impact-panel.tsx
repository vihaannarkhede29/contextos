'use client';

import { FileCode2, Files, GitBranch, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DEMO_CONVENTIONS,
  DEMO_CURSOR_EXPORT,
  DEMO_FRAMEWORKS,
  DEMO_STATS,
} from '@/components/landing/demo-data';

const IMPACT_STATS: {
  label: string;
  value: string;
  icon: typeof Files;
  isText?: boolean;
}[] = [
  { label: 'Files indexed', value: String(DEMO_STATS.filesIndexed), icon: Files },
  { label: 'Rules extracted', value: String(DEMO_STATS.rulesExtracted), icon: Layers },
  { label: 'Decisions learned', value: String(DEMO_STATS.decisionsLearned), icon: GitBranch },
  { label: 'Last index', value: DEMO_STATS.lastIndexed, icon: FileCode2, isText: true },
];

type Props = {
  className?: string;
  showExport?: boolean;
};

export function RulesImpactPanel({ className, showExport = true }: Props) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
          Live demo · indexed from this repo
        </p>
        <span className="rounded-full border border-[#1E293B] bg-[#1E293B]/50 px-2.5 py-0.5 text-[10px] text-[#F3F4F6]/45">
          Auto-exported to Cursor on every index
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {IMPACT_STATS.map(({ label, value, icon: Icon, isText }) => (
          <div
            key={label}
            className="rounded-xl border border-[#1E293B] bg-[#141b2d]/80 px-3 py-3 sm:px-4 sm:py-4"
          >
            <div className="flex items-center gap-1.5 text-[#10B981]/80">
              <Icon className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-wider text-[#F3F4F6]/40">{label}</p>
            </div>
            <p
              className={cn(
                'mt-1 font-serif font-semibold text-[#F3F4F6]',
                isText ? 'text-sm sm:text-base' : 'text-2xl sm:text-3xl',
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className={cn('grid gap-3', showExport ? 'lg:grid-cols-2' : '')}>
        <div className="rounded-xl border border-[#1E293B] bg-[#141b2d]/60 p-4">
          <p className="text-xs font-semibold text-[#F3F4F6]">Rules your agents get</p>
          <p className="mt-1 text-[11px] text-[#F3F4F6]/45">
            Frameworks, conventions, and modules — extracted automatically.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DEMO_FRAMEWORKS.slice(0, 6).map((f) => (
              <Badge
                key={f.name}
                className="border border-[#10B981]/20 bg-[#10B981]/10 text-[10px] text-[#22C55E]"
              >
                {f.name}
              </Badge>
            ))}
            <Badge className="border border-[#1E293B] bg-[#1E293B]/80 text-[10px] text-[#F3F4F6]/50">
              +{DEMO_FRAMEWORKS.length - 6} more
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {DEMO_CONVENTIONS.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-[#1E293B]/60 bg-[#0B0F19]/50 px-3 py-2"
              >
                <p className="text-xs font-medium text-[#F3F4F6]">{c.name}</p>
                <p className="text-[11px] text-[#F3F4F6]/45">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {showExport && (
          <div className="rounded-xl border border-[#1E293B] bg-[#0B0F19]/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs text-[#22C55E]">.cursor/rules/contextos.mdc</p>
              <span className="shrink-0 rounded bg-[#10B981]/15 px-2 py-0.5 text-[10px] text-[#10B981]">
                alwaysApply
              </span>
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-[#1E293B]/60 bg-[#141b2d]/50 p-3 font-mono text-[10px] leading-relaxed text-[#F3F4F6]/55 whitespace-pre-wrap">
              {DEMO_CURSOR_EXPORT}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
