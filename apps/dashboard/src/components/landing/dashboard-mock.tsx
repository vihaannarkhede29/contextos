'use client';

import { motion } from 'framer-motion';
import { InteractiveDashboard } from '@/components/landing/interactive-dashboard';

export function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 max-w-6xl md:mt-20"
    >
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#10B981]/20 via-[#10B981]/5 to-transparent blur-2xl" />
      <InteractiveDashboard compact defaultView="architecture" />
      <p className="mt-4 text-center text-[10px] text-[#F3F4F6]/35">
        Click the sidebar to explore Search, Architecture, Activity, and more
      </p>
    </motion.div>
  );
}
