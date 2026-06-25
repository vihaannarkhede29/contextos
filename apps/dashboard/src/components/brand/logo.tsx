'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  xs: { box: 'h-6 w-6', icon: 24, text: 'text-xs', sub: 'text-[9px]' },
  sm: { box: 'h-8 w-8', icon: 32, text: 'text-sm', sub: 'text-[10px]' },
  md: { box: 'h-10 w-10', icon: 40, text: 'text-base', sub: 'text-xs' },
  lg: { box: 'h-12 w-12', icon: 48, text: 'text-lg', sub: 'text-xs' },
} as const;

type LogoProps = {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
};

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const gradId = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      <circle cx="16" cy="16" r="3" fill="#F3F4F6" />
      <circle cx="16" cy="7" r="2" fill="#22C55E" />
      <circle cx="23.5" cy="20" r="2" fill="#22C55E" />
      <circle cx="8.5" cy="20" r="2" fill="#22C55E" />
      <path
        d="M16 13v-4M16 19l6.5 3.5M16 19l-6.5 3.5"
        stroke="#F3F4F6"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  size = 'sm',
  showWordmark = true,
  subtitle,
  className,
}: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={s.icon} />
      {showWordmark && (
        <div className="leading-tight">
          <span className={cn('font-medium text-[#F3F4F6]', s.text)}>ContextOS</span>
          {subtitle ? (
            <p className={cn('text-[#F3F4F6]/50', s.sub)}>{subtitle}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
