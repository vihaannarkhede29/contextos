'use client';

import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/spotlight-card';
import { WORKFLOW_STEPS } from '@/lib/site-config';

export function WorkflowSpotlight() {
  return (
    <section id="workflow" className="border-b border-[#1E293B]/40 px-6 py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-serif text-3xl text-[#F3F4F6] md:text-4xl">
            Up and running in 60 seconds
          </h2>
          <p className="mt-4 text-sm text-[#F3F4F6]/45">Three commands. Permanent superpowers.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {WORKFLOW_STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard glowColor="green" customSize className="min-h-[300px] w-full">
                <div className="flex h-full flex-col">
                  <span className="font-serif text-4xl font-bold text-[#10B981]/30">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-[#F3F4F6]">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#F3F4F6]/50">
                    {item.detail}
                  </p>
                  <div className="mt-6 rounded-lg border border-[#0B0F19]/60 bg-[#0B0F19]/70 px-4 py-3 font-mono text-sm">
                    <span className="text-[#22C55E]">$ </span>
                    <span className="text-[#F3F4F6]/90">{item.command}</span>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
