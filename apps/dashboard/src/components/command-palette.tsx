'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, GitBranch, Activity, Home, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className={cn(
            'overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl',
          )}
        >
          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation" className="text-xs text-muted-foreground">
              <Command.Item
                onSelect={() => navigate('/app')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <Home className="h-4 w-4" /> Home
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/app/search')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <Search className="h-4 w-4" /> Search
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/app/architecture')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <Layers className="h-4 w-4" /> Architecture
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/app/decisions')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <GitBranch className="h-4 w-4" /> Decisions
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/app/activity')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <Activity className="h-4 w-4" /> Activity
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Docs" className="text-xs text-muted-foreground">
              <Command.Item
                onSelect={() => navigate('/')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
              >
                <Sparkles className="h-4 w-4" /> Landing Page
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
