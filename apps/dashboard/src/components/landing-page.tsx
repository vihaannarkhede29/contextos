'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { HeroSection } from '@/components/landing/hero-section';
import { RadialGraph } from '@/components/landing/radial-graph';
import { WorkspaceTabs } from '@/components/landing/workspace-tabs';
import CTA1 from '@/components/ui/8bit-cta1';
import { WorkflowSpotlight } from '@/components/landing/workflow-spotlight';
import { DashboardShowcase } from '@/components/landing/dashboard-showcase';
import { RoiSection } from '@/components/landing/roi-section';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
};

const agentRows = [
  ['Cursor', 'Claude Code', 'Cline'],
  ['Aider', 'Windsurf', 'Continue'],
];

const complianceBadges = [
  { title: 'Local-only', sub: 'No cloud' },
  { title: 'Zero', sub: 'Telemetry' },
  { title: 'MIT', sub: 'Open source' },
  { title: 'Offline', sub: 'Embeddings' },
  { title: 'MCP', sub: 'stdio' },
  { title: 'WAL', sub: 'SQLite' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6]">
      <header className="sticky top-0 z-50 border-b border-[#1E293B]/40 bg-[#0B0F19]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-[#F3F4F6]/50 lg:flex">
            <a href="#product" className="hover:text-[#F3F4F6]">Product</a>
            <a href="#platform" className="hover:text-[#F3F4F6]">Platform</a>
            <a href="#customers" className="hover:text-[#F3F4F6]">Agents</a>
            <a href="#workflow" className="hover:text-[#F3F4F6]">Workflow</a>
            <a href="#roi" className="hover:text-[#F3F4F6]">ROI</a>
            <a href="#mcp" className="hover:text-[#F3F4F6]">MCP</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden rounded-full border-[#1E293B] bg-transparent text-[#F3F4F6]/70 sm:inline-flex"
              asChild
            >
              <a href="https://github.com/vihaannarkhede29/contextos" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <Button className="rounded-full px-5" asChild>
              <Link href="/app">Open Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <HeroSection />

      {/* Trusted by */}
      <section id="customers" className="border-b border-[#1E293B]/40 px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#F3F4F6]/35">
            Trusted by developers shipping with AI
          </p>
          <div className="mt-10 space-y-6">
            {agentRows.map((row, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3"
              >
                {row.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-medium text-[#F3F4F6]/30 transition hover:text-[#F3F4F6]/55"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <WorkflowSpotlight />

      <DashboardShowcase />

      {/* Statement */}
      <section id="product" className="border-b border-[#1E293B]/40 px-6 py-24 md:py-32 lg:px-10">
        <motion.div {...fade} className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl leading-snug md:text-[2.75rem] md:leading-tight">
            ContextOS understands every file, commit, and convention across your
            repo — so you can ship with confidence and agents invest context with
            precision.
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-sm text-[#10B981]">
            One platform, every signal.
          </p>
        </motion.div>
      </section>

      {/* 8-bit comparison — ContextOS vs without */}
      <section className="border-b border-[#1E293B]/40 bg-[#0c1019] px-6 lg:px-10">
        <motion.div {...fade}>
          <CTA1 className="py-20 md:py-28" />
        </motion.div>
      </section>

      {/* Graph */}
      <section id="platform" className="relative overflow-hidden border-b border-[#1E293B]/40 bg-[#0c1019] px-6 py-24 md:py-32 lg:px-10">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981]/6 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
              Platform
            </p>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">
              Every tool connected and unified under one graph
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#F3F4F6]/45">
              Code, git, embeddings, vectors, IDE exports, MCP. Every contribution
              attributed. Every agent query grounded in your actual codebase.
            </p>
          </motion.div>
          <motion.div {...fade} className="mx-auto mt-12 md:mt-16">
            <RadialGraph />
          </motion.div>
        </div>
      </section>

      {/* Testimonial + stats — Weave quote block */}
      <section className="border-b border-[#1E293B]/40 px-6 py-24 md:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fade} className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <blockquote className="font-serif text-2xl leading-relaxed text-[#F3F4F6]/90 md:text-3xl">
              &ldquo;Our goal is to ship the highest quality code as fast as possible.
              ContextOS gives our agents an objective map of the repo — and keeps
              itself honest as we refactor.&rdquo;
            </blockquote>
            <div>
              <TestimonialChart />
              <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <div>
                  <p className="font-serif text-5xl text-[#10B981]">+73%</p>
                  <p className="mt-2 text-sm text-[#F3F4F6]/45">
                    semantic search relevance vs. raw grep
                  </p>
                </div>
                <div>
                  <p className="font-serif text-5xl text-[#10B981]">60s</p>
                  <p className="mt-2 text-sm text-[#F3F4F6]/45">
                    from init to first Cursor rules export
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          <p className="mt-8 text-sm text-[#F3F4F6]/35">
            — Every team using local-first agent memory
          </p>
        </div>
      </section>

      <RoiSection />

      {/* Workspace tabs */}
      <section className="border-b border-[#1E293B]/40 bg-[#0c1019] px-6 py-24 md:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.h2 {...fade} className="font-serif text-center text-3xl md:text-4xl">
            Everything in one engineering workspace
          </motion.h2>
          <motion.div {...fade} className="mt-16">
            <WorkspaceTabs />
          </motion.div>
        </div>
      </section>

      {/* Mid CTA + big numbers */}
      <section className="border-b border-[#1E293B]/40 px-6 py-24 md:py-32 lg:px-10">
        <motion.div {...fade} className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl">
            Local-first memory for developers shipping with AI at scale
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-[#F3F4F6]/45">
            ContextOS connects every file, decision, and rule to agent-ready exports.
            Tuned to your codebase. Built for teams that refuse to send code to the cloud.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="lg" className="rounded-full border-[#1E293B] px-6" asChild>
              <a href="https://github.com/vihaannarkhede29/contextos" target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </Button>
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link href="/app">Open Dashboard</Link>
            </Button>
          </div>
          <div className="mt-20 grid gap-16 sm:grid-cols-2">
            <div>
              <p className="font-serif text-6xl md:text-7xl">100%</p>
              <p className="mt-2 text-sm text-[#F3F4F6]/40">local — zero cloud calls</p>
            </div>
            <div>
              <p className="font-serif text-6xl md:text-7xl">5</p>
              <p className="mt-2 text-sm text-[#F3F4F6]/40">MCP tools for Cursor agents</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enterprise badges */}
      <section className="border-b border-[#1E293B]/40 px-6 py-20 lg:px-10">
        <motion.div {...fade} className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
            Enterprise ready
          </p>
          <h2 className="mt-4 font-serif text-2xl md:text-3xl">
            Built for teams that can&apos;t afford compromise
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#F3F4F6]/45">
            No accounts. No telemetry. Your data stays on your machine — and your
            team is indexing before the end of the day.
          </p>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {complianceBadges.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/30 px-4 py-6"
              >
                <p className="text-sm font-semibold text-[#F3F4F6]">{b.title}</p>
                <p className="mt-1 text-xs text-[#F3F4F6]/40">{b.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MCP */}
      <section id="mcp" className="border-b border-[#1E293B]/40 px-6 py-20 lg:px-10">
        <motion.div {...fade} className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#1E293B] glow-emerald">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 md:p-12">
              <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
                Cursor MCP
              </p>
              <h2 className="mt-3 font-serif text-3xl">
                Agents that query your repo mid-conversation
              </h2>
              <ul className="mt-6 space-y-2.5">
                {[
                  'search_codebase',
                  'get_project_memory',
                  'get_architecture_rules',
                  'get_decisions',
                  'get_stats',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-mono text-sm text-[#22C55E]">
                    <Zap className="h-3.5 w-3.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[#1E293B] bg-[#0B0F19] p-6 font-mono text-xs leading-relaxed text-[#F3F4F6]/55 lg:border-l lg:border-t-0">
              <pre className="overflow-x-auto">{`{
  "mcpServers": {
    "contextosai": {
      "command": "contextosai",
      "args": ["mcp"],
      "env": {
        "CONTEXTOS_ROOT": "\${workspaceFolder}"
      }
    }
  }
}`}</pre>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer CTA — Weave dark band */}
      <section id="install" className="bg-[#1a2332] px-6 py-28 md:py-36 lg:px-10">
        <motion.div {...fade} className="mx-auto max-w-3xl text-center">
          <Sparkles className="mx-auto h-7 w-7 text-[#10B981]" />
          <h2 className="mt-6 font-serif text-4xl text-[#F3F4F6] md:text-5xl lg:text-[3.25rem]">
            The memory layer for the AI coding era.
          </h2>
          <p className="mt-5 text-sm text-[#F3F4F6]/45">
            Trusted by developers from side projects to production monorepos
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-[#F3F4F6]/15 bg-transparent px-7 text-[#F3F4F6]"
              asChild
            >
              <a href="https://github.com/vihaannarkhede29/contextos" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <Button size="lg" className="rounded-full px-7" asChild>
              <Link href="/app">
                Get started for free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="px-6 py-14 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo size="sm" showWordmark subtitle="Local-first memory for AI agents" />
            <p className="mt-3 max-w-xs text-sm text-[#F3F4F6]/35">MIT licensed.</p>
          </div>
          {[
            {
              title: 'Product',
              links: [
                { label: 'Dashboard', href: '/app' },
                { label: 'MCP', href: '#mcp' },
                { label: 'Install', href: '#install' },
              ],
            },
            {
              title: 'CLI',
              links: [
                { label: 'contextosai init', href: '#install' },
                { label: 'contextosai index', href: '#install' },
                { label: 'contextosai watch', href: '#install' },
              ],
            },
            {
              title: 'Company',
              links: [
                {
                  label: 'GitHub',
                  href: 'https://github.com/vihaannarkhede29/contextos',
                  external: true,
                },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wider text-[#F3F4F6]/30">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#F3F4F6]/45">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#F3F4F6]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="hover:text-[#F3F4F6]">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-14 max-w-7xl text-center text-xs text-[#F3F4F6]/25">
          © {new Date().getFullYear()} ContextOS
        </p>
      </footer>
    </div>
  );
}

function TestimonialChart() {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#141b2d] p-5">
      <div className="mb-4 flex justify-between text-[10px] text-[#F3F4F6]/35">
        <span>Day 1</span>
        <span>Day 60</span>
      </div>
      <svg viewBox="0 0 300 80" className="h-28 w-full">
        <defs>
          <linearGradient id="tFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,70 L50,65 L100,58 L150,48 L200,35 L250,22 L300,12 L300,80 L0,80 Z"
          fill="url(#tFill)"
        />
        <path
          d="M0,70 L50,65 L100,58 L150,48 L200,35 L250,22 L300,12"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
        />
        <line x1="0" y1="70" x2="300" y2="70" stroke="#1E293B" strokeWidth="0.5" strokeDasharray="4" />
      </svg>
      <p className="mt-2 text-center text-xs text-[#10B981]">Agent context coverage</p>
    </div>
  );
}
