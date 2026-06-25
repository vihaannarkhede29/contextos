'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  GitBranch,
  Home,
  Layers,
  Search,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

const links = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/search', label: 'Search', icon: Search },
  { href: '/app/architecture', label: 'Architecture', icon: Layers },
  { href: '/app/decisions', label: 'Decisions', icon: GitBranch },
  { href: '/app/activity', label: 'Activity', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#1E293B] bg-[#0B0F19]/95 backdrop-blur-xl">
      <div className="border-b border-[#1E293B] px-6 py-5">
        <Logo size="sm" subtitle="Local memory layer" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === href
                ? 'bg-[#10B981]/10 text-[#10B981]'
                : 'text-[#F3F4F6]/55 hover:bg-[#1E293B] hover:text-[#F3F4F6]',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-[#1E293B] p-4">
        <div className="rounded-lg border border-[#1E293B] bg-[#1E293B]/80 p-3 font-mono text-xs text-[#F3F4F6]/55">
          <div className="mb-1 flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-[#22C55E]" />
            <span className="text-[#F3F4F6]/80">contextosai watch</span>
          </div>
          <p className="text-[10px] text-[#F3F4F6]/40">⌘K command palette</p>
        </div>
      </div>
    </aside>
  );
}
