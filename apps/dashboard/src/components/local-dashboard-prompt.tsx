import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { COMMANDS, SITE } from '@/lib/site-config';

export function LocalDashboardPrompt() {
  const steps = [COMMANDS.install, 'cd your-project', COMMANDS.initAndIndex, COMMANDS.dashboard];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg rounded-2xl border border-[#1E293B] bg-[#1E293B]/40 p-5 sm:p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-[#10B981]">Local only</p>
        <h1 className="mt-3 text-2xl font-bold text-[#F3F4F6]">Dashboard runs on your machine</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#F3F4F6]/55">
          This hosted site is the marketing demo. The real dashboard reads{' '}
          <code className="text-[#22C55E]">.contextos/</code> from a project you index locally.
        </p>

        <div className="mt-6 space-y-2 rounded-xl border border-[#0B0F19]/60 bg-[#0B0F19]/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-[#F3F4F6]/45">
            <Terminal className="h-3.5 w-3.5 text-[#10B981]" />
            Quick start
          </div>
          {steps.map((cmd) => (
            <div key={cmd} className="font-mono text-sm text-[#22C55E]">
              <span className="text-[#F3F4F6]/35">$ </span>
              {cmd}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#10B981] px-5 py-2.5 text-sm font-medium text-[#0B0F19] hover:bg-[#0ea472]"
          >
            Back to demo
          </Link>
          <a
            href={SITE.npm}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#1E293B] px-5 py-2.5 text-sm text-[#F3F4F6]/70 hover:text-[#F3F4F6]"
          >
            View on npm
          </a>
        </div>
      </div>
    </div>
  );
}
