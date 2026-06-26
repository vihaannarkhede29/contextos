# ContextOS

**Local-first memory layer for AI coding agents.**

ContextOS continuously learns your software repository and automatically surfaces the most relevant architectural knowledge, coding conventions, and historical decisions for AI agents such as Cursor, Claude Code, Cline, and Aider.

Everything runs locally. No cloud services. No authentication. No billing.

## Quick Start

```bash
npm install -g contextosai

cd your-project
contextosai init
contextosai index
contextosai search "authentication flow"
contextosai dashboard
```

## Agent Integration

After indexing, ContextOS automatically generates:

- `.cursor/rules/contextos.mdc` — loaded by Cursor
- `AGENTS.md` — for Claude Code and other agents

Regenerate anytime:

```bash
contextosai export
```

### MCP Server (Cursor)

Add to your Cursor MCP config:

```json
{
  "mcpServers": {
    "contextosai": {
      "command": "contextosai",
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
| `contextosai init` | Initialize ContextOS in current repo |
| `contextosai index` | Index all supported files |
| `contextosai index --force` | Force full re-index (embedding provider reset) |
| `contextosai export` | Regenerate Cursor rules + AGENTS.md |
| `contextosai mcp` | Start MCP server (stdio) |
| `contextosai watch` | Watch for changes and re-index |
| `contextosai search "<query>"` | Semantic search |
| `contextosai stats` | Show indexing statistics |
| `contextosai dashboard` | Open local dashboard |

## Embeddings

**Primary:** Ollama with `nomic-embed-text`

```bash
ollama pull nomic-embed-text
```

**Fallback:** Transformers.js (`Xenova/all-MiniLM-L6-v2`) when Ollama is unavailable.

If you switch embedding providers, run `contextosai index --force` to rebuild vectors.

## Monorepo Structure

```
apps/dashboard   — Next.js 15 dashboard UI
apps/docs        — Documentation site
packages/cli     — CLI (published as `contextosai`)
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

## Deploy

The marketing landing page and interactive demo can be hosted on Netlify or Vercel. The full local dashboard (`/app`) requires `contextosai index` on your machine.

### Netlify (recommended)

1. Sign in at [app.netlify.com](https://app.netlify.com) with GitHub
2. **Add new site** → **Import an existing project** → **GitHub**
3. Select **[vihaannarkhede29/contextos](https://github.com/vihaannarkhede29/contextos)**
4. Netlify reads `netlify.toml` automatically — no manual build settings needed
5. Click **Deploy site**

Direct import: [app.netlify.com/start/deploy?repository=https://github.com/vihaannarkhede29/contextos](https://app.netlify.com/start/deploy?repository=https://github.com/vihaannarkhede29/contextos)

### Vercel

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
| Search returns 0% scores | Run `contextosai index --force` |
| Embedding dimension mismatch | Run `contextosai index --force` after Ollama setup |
| Dashboard not found | Reinstall: `npm install -g contextosai` |
| No decisions learned | Ensure git repo with migration-style commit messages |

## Publish to npm

1. Add `NPM_TOKEN` to GitHub repo secrets
2. Tag and push: `git tag v0.1.0 && git push origin v0.1.0`
3. GitHub Actions publishes `@contextosai/shared`, `@contextosai/core`, and `contextosai`

Verify install on a clean machine:

```bash
npm install -g contextosai
contextosai init && contextosai index
contextosai dashboard
```

## License

MIT
