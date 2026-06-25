'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Node = { label: string; angle: number; ring: 'outer' | 'inner' };

const nodes: Node[] = [
  { label: 'Code', angle: -90, ring: 'outer' },
  { label: 'Git', angle: -30, ring: 'outer' },
  { label: 'Ollama', angle: 30, ring: 'outer' },
  { label: 'Cursor', angle: 90, ring: 'outer' },
  { label: 'MCP', angle: 150, ring: 'outer' },
  { label: 'Rules', angle: 210, ring: 'outer' },
  { label: 'Vectors', angle: -55, ring: 'inner' },
  { label: 'Agents', angle: 55, ring: 'inner' },
  { label: 'Export', angle: 175, ring: 'inner' },
];

const RING = { outer: 36, inner: 22 } as const;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
}

function labelOffset(angleDeg: number, radius: number, extra: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + (radius + extra) * Math.cos(rad);
  const y = 50 + (radius + extra) * Math.sin(rad);
  const anchor =
    Math.abs(Math.cos(rad)) < 0.15 ? 'center' : Math.cos(rad) > 0 ? 'start' : 'end';
  return { x, y, anchor };
}

export function RadialGraph() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[#10B981]/8 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-square w-full"
        onMouseLeave={() => setHovered(null)}
      >
        <svg viewBox="0 0 100 100" className="pointer-events-none h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#10B981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#22C55E" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
            </linearGradient>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[40, 30, 20, 10].map((r) => (
            <circle
              key={r}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#1E293B"
              strokeWidth={r === 40 ? 0.35 : 0.2}
              opacity={r === 40 ? 0.9 : 0.55}
            />
          ))}

          {nodes.map((n) => {
            const r = RING[n.ring];
            const p = polar(n.angle, r);
            const active = hovered === n.label;
            return (
              <line
                key={`line-${n.label}`}
                x1="50"
                y1="50"
                x2={p.x}
                y2={p.y}
                stroke="url(#spokeGrad)"
                strokeWidth={n.ring === 'outer' ? 0.35 : 0.25}
                opacity={active ? 1 : 0.45}
              />
            );
          })}

          <circle cx="50" cy="50" r="14" fill="url(#hubGlow)" />
          <motion.circle
            cx="50"
            cy="50"
            r="5"
            fill="#10B981"
            filter="url(#nodeGlow)"
            animate={{ r: [5, 5.8, 5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx="50" cy="50" r="2.2" fill="#22C55E" />

          {nodes.map((n) => {
            const r = RING[n.ring];
            const p = polar(n.angle, r);
            const active = hovered === n.label;
            return (
              <g key={`node-${n.label}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? (n.ring === 'outer' ? 3.4 : 2.8) : n.ring === 'outer' ? 2.8 : 2.2}
                  fill="#0B0F19"
                  stroke="#10B981"
                  strokeWidth={active ? 0.7 : 0.5}
                  filter="url(#nodeGlow)"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 1.2 : 0.9}
                  fill="#22C55E"
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0">
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-[#22C55E] md:text-xs">
            ContextOS
          </span>

          {nodes.map((n) => {
            const r = RING[n.ring];
            const p = polar(n.angle, r);
            const extra = n.ring === 'outer' ? 7 : 5.5;
            const { x, y, anchor } = labelOffset(n.angle, r, extra);
            const align =
              anchor === 'start'
                ? 'translate-x-0'
                : anchor === 'end'
                  ? '-translate-x-full'
                  : '-translate-x-1/2';
            const active = hovered === n.label;

            return (
              <div key={n.label}>
                <button
                  type="button"
                  aria-label={n.label}
                  className="absolute z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition hover:bg-[#10B981]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onMouseEnter={() => setHovered(n.label)}
                  onFocus={() => setHovered(n.label)}
                  onBlur={() => setHovered(null)}
                />

                <span
                  className={cn(
                    'pointer-events-none absolute z-20 whitespace-nowrap rounded-full border border-[#1E293B]/80 bg-[#141b2d]/95 px-2.5 py-1 font-mono text-[9px] text-[#F3F4F6]/90 shadow-lg backdrop-blur-sm transition-all duration-200 md:text-[10px]',
                    align,
                    '-translate-y-1/2',
                    active
                      ? 'scale-100 opacity-100'
                      : 'scale-95 opacity-0',
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {n.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
