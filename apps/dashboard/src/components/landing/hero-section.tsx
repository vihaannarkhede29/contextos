'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardMock } from '@/components/landing/dashboard-mock';

const stats = [
  { value: '100%', label: 'local' },
  { value: '5', label: 'MCP tools' },
  { value: '$0', label: 'subscription' },
];

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-[#1E293B]/40 px-6 pb-8 pt-12 md:pt-16 lg:px-10">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#10B981]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#1E293B]/40 px-4 py-1.5 text-xs text-[#F3F4F6]/55 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            Local-first memory layer · MIT · zero telemetry
          </span>
        </motion.div>

        <div className="mt-10 text-center lg:mt-12">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mx-auto max-w-4xl font-serif text-[2.5rem] leading-[1.05] tracking-tight md:text-6xl lg:text-[4.5rem]"
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
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#F3F4F6]/50 md:text-lg"
          >
            ContextOS turns your repository into persistent agent memory — architecture,
            conventions, and git decisions — calibrated to your codebase, not generic prompts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mx-auto mt-10 max-w-xl"
          >
            <div className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#141b2d]/80 p-1.5 pl-4 shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-sm">
              <Terminal className="h-4 w-4 shrink-0 text-[#10B981]/70" />
              <code className="flex-1 truncate text-left font-mono text-sm text-[#22C55E]">
                npm install -g contextos
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText('npm install -g contextos');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-medium text-[#0B0F19] transition hover:bg-[#0ea472]"
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

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="rounded-full px-6" asChild>
                <Link href="/app">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-[#1E293B] bg-transparent px-6 text-[#F3F4F6]/70"
                asChild
              >
                <a href="https://github.com/vihaannarkhede29/contextos" target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-2xl text-[#F3F4F6] md:text-3xl">{s.value}</p>
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
