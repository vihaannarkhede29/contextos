import Link from 'next/link';
import { notFound } from 'next/navigation';

const content: Record<string, { title: string; body: string }> = {
  '': {
    title: 'Getting Started',
    body: `# Getting Started

ContextOS is a **local-first memory layer** for AI coding agents. It continuously learns your software repository and surfaces relevant architectural knowledge, coding conventions, and historical decisions.

## Quick Start

\`\`\`bash
npm install -g contextos
cd your-project
contextos init
contextos index
contextos search "authentication flow"
\`\`\`

## What ContextOS Does

- **Indexes** your codebase (TypeScript, Python, Go, Java, Markdown)
- **Embeds** file summaries for semantic search
- **Extracts** architecture rules and framework detection
- **Learns** from git commit history for decision memory
- **Watches** for file changes and re-indexes incrementally

## Requirements

- Node.js 20+
- Optional: [Ollama](https://ollama.ai) with \`nomic-embed-text\` for embeddings
- Falls back to Transformers.js if Ollama is unavailable`,
  },
  installation: {
    title: 'Installation',
    body: `# Installation

## Global Install

\`\`\`bash
npm install -g contextos
\`\`\`

## From Source (Monorepo)

\`\`\`bash
git clone https://github.com/contextos/contextos.git
cd contextos
pnpm install
pnpm build
pnpm --filter contextos link --global
\`\`\`

## Ollama Setup (Recommended)

\`\`\`bash
ollama pull nomic-embed-text
\`\`\`

ContextOS uses Ollama at \`http://localhost:11434\` by default. If unavailable, it falls back to a local Transformers.js model.`,
  },
  cli: {
    title: 'CLI Commands',
    body: `# CLI Commands

## contextos init

Initialize ContextOS in the current repository. Creates a \`.contextos/\` directory.

## contextos index

Scan and index all supported files. Extracts symbols, generates embeddings, learns decisions, writes \`.contextos/project.md\`, and exports agent context.

\`\`\`bash
contextos index
contextos index --incremental
contextos index --force
\`\`\`

## contextos export

Regenerate \`.cursor/rules/contextos.mdc\` and \`AGENTS.md\` from the current index.

## contextos mcp

Start the MCP server (stdio) for Cursor integration.

\`\`\`json
{
  "mcpServers": {
    "contextos": {
      "command": "contextos",
      "args": ["mcp"],
      "env": { "CONTEXTOS_ROOT": "\${workspaceFolder}" }
    }
  }
}
\`\`\`

## contextos watch

Watch for file changes and re-index incrementally.

## contextos search

Semantic search across indexed files.

\`\`\`bash
contextos search "authentication middleware"
contextos search "database schema" --limit 5
\`\`\`

## contextos stats

Show indexing statistics.

## contextos dashboard

Open the local dashboard at http://localhost:3000`,
  },
  architecture: {
    title: 'Architecture',
    body: `# Architecture

ContextOS is a Turborepo monorepo:

\`\`\`
apps/dashboard   — Next.js 15 dashboard UI
apps/docs        — Documentation site
packages/cli     — CLI entry point
packages/core    — Indexing engine
packages/shared  — Types and schemas
\`\`\`

## Storage

- **SQLite** (\`.contextos/contextos.db\`) — File metadata, decisions, rules, activity
- **LanceDB** (\`.contextos/vectors.lance\`) — Vector embeddings for semantic search

## Parsing

Tree-sitter with regex fallback for TypeScript, JavaScript, Python, Go, and Java.

## Embeddings

1. **Primary**: Ollama with \`nomic-embed-text\`
2. **Fallback**: Transformers.js (\`Xenova/all-MiniLM-L6-v2\`)`,
  },
  contributing: {
    title: 'Contributing',
    body: `# Contributing

We welcome contributions! ContextOS is MIT licensed.

## Development

\`\`\`bash
pnpm install
pnpm build
pnpm test
pnpm smoke
\`\`\`

## Agent Integration

- \`contextos export\` — regenerate Cursor rules
- \`contextos mcp\` — MCP server for Cursor

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Embedding dimension mismatch | \`contextos index --force\` |
| Ollama unavailable | \`ollama pull nomic-embed-text\` or use Transformers fallback |
| Dashboard not found after global install | Reinstall \`contextos\` npm package |

## Project Structure

- Add CLI commands in \`packages/cli\`
- Core logic goes in \`packages/core\`
- Shared types in \`packages/shared\`
- Dashboard UI in \`apps/dashboard\``,
  },
};

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={elements.length} className="my-4 list-disc space-y-1 pl-6 text-zinc-300">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre
            key={elements.length}
            className="my-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm text-emerald-300"
          >
            {codeLines.join('\n')}
          </pre>,
        );
        codeLines = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={elements.length} className="mb-6 text-3xl font-bold">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={elements.length} className="mb-4 mt-8 text-xl font-semibold text-emerald-400">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1'));
    } else if (line.trim()) {
      flushList();
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-800 px-1 text-emerald-300">$1</code>');
      elements.push(
        <p
          key={elements.length}
          className="my-3 text-zinc-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />,
      );
    }
  }
  flushList();
  return <>{elements}</>;
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const key = slug?.join('/') ?? '';
  const page = content[key];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-8 py-6">
        <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Docs
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-12">
        <SimpleMarkdown text={page.body} />
      </main>
    </div>
  );
}
