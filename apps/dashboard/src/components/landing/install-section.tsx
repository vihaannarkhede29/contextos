'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Github, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CLI_REFERENCE, COMMANDS, MCP_CONFIG, QUICK_START, SITE } from '@/lib/site-config';

function CopyBlock({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative">
      {label ? (
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#F3F4F6]/35">{label}</p>
      ) : null}
      <div className="flex items-start gap-2 rounded-xl border border-[#1E293B] bg-[#0B0F19]/80 p-3 font-mono text-xs leading-relaxed text-[#22C55E]">
        <code className="flex-1 whitespace-pre-wrap break-all">{text}</code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 rounded-md p-1.5 text-[#F3F4F6]/40 transition hover:bg-[#1E293B] hover:text-[#F3F4F6]"
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function InstallSection() {
  return (
    <section id="install" className="border-b border-[#1E293B]/40 bg-[#1a2332] px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">Install</p>
          <h2 className="mt-4 font-serif text-3xl text-[#F3F4F6] md:text-4xl">
            Ready in 60 seconds
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#F3F4F6]/45">
            Install globally via npm, then run in any repo. 100% local — no accounts, no cloud.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 space-y-6"
        >
          <CopyBlock label="Quick start" text={QUICK_START.join('\n')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#1E293B] bg-[#141b2d]/60 px-4 py-3 text-sm text-[#F3F4F6]/70 transition hover:border-[#10B981]/30 hover:text-[#F3F4F6]"
            >
              <Github className="h-4 w-4 shrink-0 text-[#10B981]" />
              <span className="truncate font-mono text-xs">{SITE.github.replace('https://', '')}</span>
            </a>
            <a
              href={SITE.npm}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#1E293B] bg-[#141b2d]/60 px-4 py-3 text-sm text-[#F3F4F6]/70 transition hover:border-[#10B981]/30 hover:text-[#F3F4F6]"
            >
              <Terminal className="h-4 w-4 shrink-0 text-[#10B981]" />
              <span className="truncate font-mono text-xs">npm install -g {SITE.cli}</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14"
        >
          <h3 className="mb-6 text-center font-serif text-xl text-[#F3F4F6]">All CLI commands</h3>
          <div className="overflow-hidden rounded-xl border border-[#1E293B]">
            <div className="divide-y divide-[#1E293B]/60">
              {CLI_REFERENCE.map(({ cmd, desc }) => (
                <div
                  key={cmd}
                  className="flex flex-col gap-1 bg-[#141b2d]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <code className="font-mono text-xs text-[#22C55E]">{cmd}</code>
                  <span className="text-xs text-[#F3F4F6]/45">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14"
        >
          <h3 className="mb-4 text-center font-serif text-xl text-[#F3F4F6]">Cursor MCP config</h3>
          <CopyBlock text={MCP_CONFIG} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          <Button size="lg" className="rounded-full px-7" asChild>
            <Link href="/app">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-[#F3F4F6]/15 bg-transparent px-7 text-[#F3F4F6]"
            asChild
          >
            <a href={SITE.github} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
