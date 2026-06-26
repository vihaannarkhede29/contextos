'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardMock } from '@/components/landing/dashboard-mock';
import { COMMANDS, SITE } from '@/lib/site-config';

const stats = [
  { value: '100%', label: 'local' },
  { value: '5', label: 'MCP tools' },
  { value: '$0', label: 'subscription' },
];

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-[#1E293B]/40 px-4 pb-8 pt-10 sm:px-6 sm:pt-12 md:pt-16 lg:px-10">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-full max-w-[900px] -translate-x-1/2 rounded-full bg-[#10B981]/10 blur-[100px] sm:h-[520px] sm:blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-[#1E293B] bg-[#1E293B]/40 px-3 py-1.5 text-center text-[11px] text-[#F3F4F6]/55 backdrop-blur-sm sm:px-4 sm:text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            Local-first · MIT ·{' '}
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="text-[#10B981] hover:underline"
            >
              <span className="sm:hidden">GitHub</span>
              <span className="hidden sm:inline">github.com/vihaannarkhede29/contextos</span>
            </a>
          </span>
        </motion.div>

        <div className="mt-8 text-center sm:mt-10 lg:mt-12">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mx-auto max-w-4xl font-serif text-[2rem] leading-[1.08] tracking-tight sm:text-[2.5rem] md:text-6xl lg:text-[4.5rem]"
          >
            Codebase{' '}
            <span className="text-gradient-hero">memory</span>
            <br className="hidden sm:block" />
            {' '}for the AI era.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl px-1 text-sm leading-relaxed text-[#F3F4F6]/50 sm:mt-6 sm:text-base md:text-lg"
          >
            ContextOS turns your repository into persistent agent memory — architecture,
            conventions, and git decisions — calibrated to your codebase, not generic prompts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mx-auto mt-8 max-w-xl sm:mt-10"
          >
            <div className="flex flex-col gap-2 rounded-xl border border-[#1E293B] bg-[#141b2d]/80 p-2 shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-sm sm:flex-row sm:items-center sm:gap-2 sm:p-1.5 sm:pl-4">
              <div className="flex min-w-0 items-center gap-2 px-1 sm:flex-1 sm:px-0">
                <Terminal className="h-4 w-4 shrink-0 text-[#10B981]/70" />
                <code className="min-w-0 flex-1 text-left font-mono text-xs text-[#22C55E] sm:truncate sm:text-sm">
                  {COMMANDS.install}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(COMMANDS.install);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-medium text-[#0B0F19] transition hover:bg-[#0ea472] sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
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

            <p className="mt-3 px-1 text-center font-mono text-[10px] leading-relaxed text-[#F3F4F6]/35 sm:text-[11px]">
              then{' '}
              <span className="block text-[#22C55E]/80 sm:inline">{COMMANDS.initAndIndex}</span>
              <span className="hidden sm:inline"> · </span>
              <span className="block text-[#22C55E]/80 sm:inline">{COMMANDS.watch}</span>
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
              <Button size="lg" className="w-full rounded-full px-6 sm:w-auto" asChild>
                <Link href="#install">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full border-[#1E293B] bg-transparent px-6 text-[#F3F4F6]/70 sm:w-auto"
                asChild
              >
                <a href={SITE.github} target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:mt-10 sm:gap-8 md:gap-12"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-xl text-[#F3F4F6] sm:text-2xl md:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#F3F4F6]/35">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <DashboardMock />
      </div>
    </section>
  );
}
