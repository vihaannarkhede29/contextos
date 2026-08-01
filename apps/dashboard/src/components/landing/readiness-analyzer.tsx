'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReadinessGrade, ReadinessReport } from '@contextosai/shared';
import { cn } from '@/lib/utils';

type ApiResponse = {
  owner: string;
  repo: string;
  branch: string;
  fileCount: number;
  report: ReadinessReport;
  error?: string;
};

function gradeColor(grade: ReadinessGrade): string {
  if (grade === 'A' || grade === 'B') return 'text-[#22C55E]';
  if (grade === 'C') return 'text-amber-400';
  return 'text-red-400';
}

function ReadinessRadar({ report }: { report: ReadinessReport }) {
  const dims = report.dimensions;
  const cx = 120;
  const cy = 120;
  const maxR = 88;
  const n = dims.length;

  const point = (i: number, score: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = (score / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const poly = dims
    .map((d, i) => {
      const p = point(i, d.score);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 240 240" className="mx-auto h-56 w-56 sm:h-64 sm:w-64">
      {rings.map((t) => (
        <polygon
          key={t}
          points={dims
            .map((_, i) => {
              const p = point(i, t * 100);
              return `${p.x},${p.y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#1E293B"
          strokeWidth="1"
        />
      ))}
      {dims.map((_, i) => {
        const p = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#1E293B"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={poly}
        fill="rgba(16,185,129,0.2)"
        stroke="#10B981"
        strokeWidth="2"
      />
      {dims.map((d, i) => {
        const p = point(i, 100);
        const labelR = maxR + 18;
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        return (
          <g key={d.id}>
            <circle cx={point(i, d.score).x} cy={point(i, d.score).y} r="3" fill="#10B981" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#F3F4F6]/55"
              fontSize="8"
            >
              {d.name.split(' ')[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ReadinessAnalyzer() {
  const [url, setUrl] = useState('https://github.com/vihaannarkhede29/contextos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const analyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = (await res.json()) as ApiResponse & { error?: string };
      if (!res.ok) {
        setData(null);
        setError(json.error ?? 'Analysis failed');
        return;
      }
      setData(json);
    } catch {
      setError('Network error — try again');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="readiness"
      className="border-b border-[#1E293B]/40 bg-[#0c1019] px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
            Agent Readiness
          </p>
          <h2 className="mt-4 font-serif text-3xl text-[#F3F4F6] md:text-4xl">
            Is your repo ready for AI agents?
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#F3F4F6]/45">
            Paste a public GitHub URL. ContextOS scores Agent Memory, Docs, Testing, Build,
            Code Quality, and Security — then tells you what to fix.
          </p>
        </motion.div>

        <motion.form
          onSubmit={analyze}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F3F4F6]/35" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="h-11 border-[#1E293B] bg-[#0B0F19] pl-10 text-sm text-[#F3F4F6]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="h-11 rounded-full px-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </motion.form>

        {error && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-red-400">{error}</p>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0B0F19]/80"
          >
            <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.1fr_1fr] md:p-8">
              <div>
                <p className="text-xs text-[#F3F4F6]/40">
                  {data.owner}/{data.repo} · {data.branch} · {data.fileCount} files
                </p>
                <p className="mt-4 font-serif text-5xl text-[#10B981]">
                  {data.report.level}
                  <span className="text-2xl text-[#F3F4F6]/40"> / 5</span>
                </p>
                <p className="mt-2 text-lg font-medium text-[#F3F4F6]">{data.report.label}</p>
                <p className="mt-1 text-sm text-[#F3F4F6]/45">
                  {data.report.percentChecksPassed}% checks passed · {data.report.overallScore}
                  /100
                </p>
                {data.report.strengths.length > 0 && (
                  <p className="mt-6 text-xs text-[#F3F4F6]/45">
                    Strengths:{' '}
                    <span className="text-[#22C55E]">{data.report.strengths.join(', ')}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center">
                <ReadinessRadar report={data.report} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#F3F4F6]/35">
                  Grades
                </p>
                <ul className="mt-3 space-y-2">
                  {data.report.dimensions.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between text-sm text-[#F3F4F6]/70"
                    >
                      <span>{d.name}</span>
                      <span className={cn('font-mono font-bold', gradeColor(d.grade))}>
                        {d.grade}{' '}
                        <span className="font-normal text-[#F3F4F6]/35">{d.score}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {data.report.nextSteps.length > 0 && (
              <div className="border-t border-[#1E293B] px-6 py-6 md:px-8">
                <p className="text-xs font-medium uppercase tracking-wider text-[#10B981]">
                  Next steps → Level {Math.min(5, data.report.level + 1)}
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.report.nextSteps.slice(0, 6).map((step) => (
                    <li
                      key={step.id}
                      className="rounded-xl border border-[#1E293B] bg-[#141b2d]/50 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-[#F3F4F6]">{step.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#F3F4F6]/45">
                        {step.detail}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-center text-xs text-[#F3F4F6]/35">
                  Full local memory + decisions:{' '}
                  <code className="text-[#22C55E]">npm install -g contextosai</code>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
