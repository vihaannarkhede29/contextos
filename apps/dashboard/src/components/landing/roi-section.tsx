'use client';

import { motion } from 'framer-motion';
import { DollarSign, Clock, CloudOff, Sparkles } from 'lucide-react';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
};

const tiers = [
  {
    icon: CloudOff,
    label: 'Software cost',
    value: '$0',
    detail: 'MIT · no subscription · no per-seat memory SaaS',
    note: 'vs. $20–100/dev/mo for cloud codebase tools',
  },
  {
    icon: Clock,
    label: 'Dev time recovered',
    value: '~$300–600',
    detail: 'per developer per month (estimated)',
    note: 'Assumes 1 hr/week saved at $75–150/hr loaded rate',
  },
  {
    icon: Sparkles,
    label: 'AI token waste',
    value: '~$15–90',
    detail: 'per power user per month (estimated)',
    note: 'Fewer re-prompts, bad diffs, and context re-explains',
  },
  {
    icon: DollarSign,
    label: 'Team of 5',
    value: '$10k–30k',
    detail: 'annual time value (estimated range)',
    note: 'Conservative; scales with agent usage intensity',
  },
];

const assumptions = [
  '30–60 min/week less hunting for code and re-onboarding agents',
  'Fewer convention-breaking suggestions that need rework',
  'No cloud RAG subscription or per-repo indexing fees',
  'Embeddings run locally via Ollama or Transformers.js',
];

export function RoiSection() {
  return (
    <section id="roi" className="border-b border-[#1E293B]/40 bg-[#0c1019] px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
            ROI
          </p>
          <h2 className="mt-4 font-serif text-3xl text-[#F3F4F6] md:text-4xl">
            Bad context is expensive. Good memory pays for itself.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#F3F4F6]/45">
            ContextOS doesn&apos;t replace your AI subscription — it cuts the waste around
            it. Estimates below assume daily agent use; your mileage varies.
          </p>
        </motion.div>

        <motion.div
          {...fade}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="rounded-xl border border-[#1E293B] bg-[#141b2d]/60 p-6"
            >
              <tier.icon className="h-4 w-4 text-[#10B981]" />
              <p className="mt-4 text-[10px] uppercase tracking-widest text-[#F3F4F6]/35">
                {tier.label}
              </p>
              <p className="mt-2 font-serif text-3xl text-[#F3F4F6] md:text-4xl">
                {tier.value}
              </p>
              <p className="mt-2 text-sm text-[#F3F4F6]/55">{tier.detail}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-[#F3F4F6]/30">
                {tier.note}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          {...fade}
          className="mt-10 rounded-xl border border-[#1E293B]/60 bg-[#0B0F19]/50 p-6 md:p-8"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#F3F4F6]/35">
            How we estimate
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {assumptions.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-[#F3F4F6]/45"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#10B981]" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[11px] text-[#F3F4F6]/25">
            Not a guarantee. Measured benchmarks: +73% search relevance vs. grep, 60s to
            first agent export. Dollar figures are illustrative ranges, not audited savings.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
