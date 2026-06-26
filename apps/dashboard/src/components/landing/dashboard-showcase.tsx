'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveDashboard } from '@/components/landing/interactive-dashboard';

export function DashboardShowcase() {
  return (
    <section className="border-b border-[#1E293B]/40 bg-[#0c1019] px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">
            Product
          </p>
          <h2 className="mt-4 font-serif text-3xl text-[#F3F4F6] md:text-4xl">
            See your codebase the way agents do
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[#F3F4F6]/45">
            Architecture rules, semantic search, and live activity — all in one local
            dashboard. Try it right here.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-14 max-w-5xl"
        >
          <InteractiveDashboard defaultView="search" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button className="rounded-full px-6" asChild>
            <Link href="/app">
              Open the full dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
