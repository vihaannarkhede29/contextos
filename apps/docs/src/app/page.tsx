import Link from 'next/link';

const pages = [
  { href: '/docs', title: 'Getting Started', desc: 'Introduction to ContextOS' },
  { href: '/docs/installation', title: 'Installation', desc: 'Install ContextOS globally' },
  { href: '/docs/cli', title: 'CLI Commands', desc: 'All ContextOS CLI commands' },
  { href: '/docs/architecture', title: 'Architecture', desc: 'How ContextOS works internally' },
  { href: '/docs/contributing', title: 'Contributing', desc: 'Contribute to ContextOS' },
];

export default function DocsHome() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-8 py-6">
        <Link href="/" className="text-xl font-bold text-emerald-400">
          ContextOS Docs
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-zinc-400">
          Local-first memory layer for AI coding agents.
        </p>
        <div className="mt-12 space-y-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="block rounded-lg border border-zinc-800 p-6 transition-colors hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <h2 className="text-lg font-semibold text-emerald-400">{page.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{page.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
