# ContextOS

**Local-first memory layer for AI coding agents.**

ContextOS continuously learns your software repository and automatically surfaces the most relevant architectural knowledge, coding conventions, and historical decisions for AI agents such as Cursor, Claude Code, Cline, and Aider.

Everything runs locally. No cloud services. No authentication. No billing.

## Quick Start

```bash
npm install -g contextos

cd your-project
contextos init
contextos index
contextos search "authentication flow"
contextos dashboard
```

## Agent Integration

After indexing, ContextOS automatically generates:

- `.cursor/rules/contextos.mdc` — loaded by Cursor
- `AGENTS.md` — for Claude Code and other agents

Regenerate anytime:

```bash
contextos export
```

### MCP Server (Cursor)

Add to your Cursor MCP config:

```json
{
  "mcpServers": {
    "contextos": {
      "command": "contextos",
      "args": ["mcp"],
      "env": {
        "CONTEXTOS_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

Tools: `search_codebase`, `get_project_memory`, `get_architecture_rules`, `get_decisions`, `get_stats`

## CLI Commands

| Command | Description |
|---------|-------------|
| `contextos init` | Initialize ContextOS in current repo |
| `contextos index` | Index all supported files |
| `contextos index --force` | Force full re-index (embedding provider reset) |
| `contextos export` | Regenerate Cursor rules + AGENTS.md |
| `contextos mcp` | Start MCP server (stdio) |
| `contextos watch` | Watch for changes and re-index |
| `contextos search "<query>"` | Semantic search |
| `contextos stats` | Show indexing statistics |
| `contextos dashboard` | Open local dashboard |

## Embeddings

**Primary:** Ollama with `nomic-embed-text`

```bash
ollama pull nomic-embed-text
```

**Fallback:** Transformers.js (`Xenova/all-MiniLM-L6-v2`) when Ollama is unavailable.

If you switch embedding providers, run `contextos index --force` to rebuild vectors.

## Monorepo Structure

```
apps/dashboard   — Next.js 15 dashboard UI
apps/docs        — Documentation site
packages/cli     — CLI (published as `contextos`)
packages/core    — Indexing engine
packages/shared  — Shared types and schemas
```

## Development

```bash
pnpm install
pnpm build
pnpm test
bash scripts/smoke-test.sh
```

## Deploy (Vercel)

The marketing landing page and interactive demo deploy to Vercel. The full local dashboard (`/app`) requires `contextos index` on your machine.

1. Import [github.com/vihaannarkhede29/contextos](https://github.com/vihaannarkhede29/contextos) in [Vercel](https://vercel.com/new)
2. Set **Root Directory** to `apps/dashboard`
3. Framework preset: **Next.js** (install/build commands are in `apps/dashboard/vercel.json`)
4. Deploy

Or from CLI after `npx vercel login`:

```bash
cd apps/dashboard
npx vercel deploy --prod
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Search returns 0% scores | Run `contextos index --force` |
| Embedding dimension mismatch | Run `contextos index --force` after Ollama setup |
| Dashboard not found | Reinstall: `npm install -g contextos` |
| No decisions learned | Ensure git repo with migration-style commit messages |

## License

MIT
