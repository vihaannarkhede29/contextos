import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/8bit-card';

export interface ComparisonRow {
  feature: string;
  theirs: string;
  yours: string;
}

interface CTA1Props {
  className?: string;
  description?: string;
  rows?: ComparisonRow[];
  theirsLabel?: string;
  title?: string;
  yoursLabel?: string;
}

import { COMMANDS, SITE } from '@/lib/site-config';

export const contextOSComparisonRows: ComparisonRow[] = [
  { feature: 'Setup', yours: COMMANDS.init, theirs: 'Re-explain every chat' },
  { feature: 'Cursor rules', yours: '+ Auto-export', theirs: '- Manual paste' },
  { feature: 'Code search', yours: '+ Semantic', theirs: '- grep only' },
  { feature: 'Git decisions', yours: '+ Learned', theirs: '- Forgotten' },
  { feature: 'Privacy', yours: '100% local', theirs: 'Cloud RAG' },
  { feature: 'Freshness', yours: '+ Live watch', theirs: '- Stale on save' },
];

export default function CTA1({
  title = 'Why ContextOS?',
  description = 'Side-by-side. No fluff.',
  yoursLabel = 'ContextOS',
  theirsLabel = 'Without memory',
  rows = contextOSComparisonRows,
  className,
}: CTA1Props) {
  return (
    <section className={cn('w-full px-4 py-16', className)}>
      <div className="mx-auto max-w-3xl">
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="retro mb-3 text-2xl font-bold tracking-tight text-[#F3F4F6] md:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro text-[9px] text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        <Card>
          <CardHeader className="hidden md:block">
            <div className="grid gap-4 md:grid-cols-3">
              <CardTitle className="retro text-[10px] text-muted-foreground">FEATURE</CardTitle>
              <CardTitle className="retro text-center text-xs text-primary">{yoursLabel}</CardTitle>
              <CardTitle className="retro text-center text-xs text-muted-foreground">
                {theirsLabel}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-[#0B0F19]/60">
              {rows.map((row) => (
                <div
                  className="grid gap-2 py-3 md:grid-cols-3 md:gap-4 md:py-3"
                  key={row.feature}
                >
                  <span className="text-xs font-medium text-[#F3F4F6]/80">{row.feature}</span>
                  <div className="flex items-center justify-between gap-3 md:contents">
                    <span className="retro text-[10px] text-primary md:hidden">{yoursLabel}</span>
                    <span className="retro text-[10px] text-[#22C55E] md:text-center">
                      {row.yours}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:contents">
                    <span className="retro text-[10px] text-muted-foreground md:hidden">
                      {theirsLabel}
                    </span>
                    <span className="retro text-[10px] text-muted-foreground md:text-center">
                      {row.theirs}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
