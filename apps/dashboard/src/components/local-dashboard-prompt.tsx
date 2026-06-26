'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { InteractiveDashboard } from '@/components/landing/interactive-dashboard';
import { RulesImpactPanel } from '@/components/landing/rules-impact-panel';
import { COMMANDS, SITE } from '@/lib/site-config';

const QUICK_START = [COMMANDS.install, COMMANDS.initAndIndex, COMMANDS.dashboard] as const;

export function LocalDashboardPrompt() {
  const [copied, setCopied] = useState(false);
  const copyText = QUICK_START.join('\n');

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B]/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
                Demo on this site · yours runs locally
              </p>
              <h1 className="mt-2 text-xl font-bold text-[#F3F4F6] sm:text-2xl">
                See the impact now — install for your repo
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#F3F4F6]/55">
                Below is real sample data from the ContextOS repo. Run these commands in{' '}
                <strong className="text-[#F3F4F6]/80">your</strong> project to get the same
                rules, stats, and search on{' '}
                <code className="text-[#22C55E]">localhost:3000</code>.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-[#0B0F19]/60 bg-[#0B0F19]/70 p-3 sm:min-w-[280px]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#F3F4F6]/45">
                  <Terminal className="h-3.5 w-3.5 text-[#10B981]" />
                  Quick start
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(copyText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-[#F3F4F6]/50 hover:bg-[#1E293B] hover:text-[#F3F4F6]"
                  aria-label="Copy quick start commands"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              {QUICK_START.map((cmd) => (
                <div key={cmd} className="font-mono text-xs text-[#22C55E] sm:text-sm">
                  <span className="text-[#F3F4F6]/35">$ </span>
                  {cmd}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-[#1E293B] px-4 py-2 text-xs text-[#F3F4F6]/70 hover:text-[#F3F4F6]"
            >
              ← Landing page
            </Link>
            <a
              href={SITE.npm}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#1E293B] px-4 py-2 text-xs text-[#F3F4F6]/70 hover:text-[#F3F4F6]"
            >
              View on npm
            </a>
          </div>
        </div>

        <div className="mt-8">
          <RulesImpactPanel />
        </div>

        <div className="mt-8">
          <InteractiveDashboard defaultView="home" />
        </div>
      </div>
    </div>
  );
}
