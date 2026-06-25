export const SITE = {
  product: 'ContextOS',
  cli: 'contextosai',
  github: 'https://github.com/vihaannarkhede29/contextos',
  npm: 'https://www.npmjs.com/package/contextosai',
} as const;

export const COMMANDS = {
  install: 'npm install -g contextosai',
  init: 'contextosai init',
  index: 'contextosai index',
  initAndIndex: 'contextosai init && contextosai index',
  watch: 'contextosai watch',
  search: 'contextosai search "authentication middleware"',
  dashboard: 'contextosai dashboard',
  export: 'contextosai export',
  mcp: 'contextosai mcp',
} as const;

export const QUICK_START = [
  COMMANDS.install,
  'cd your-project',
  COMMANDS.init,
  COMMANDS.index,
  COMMANDS.watch,
] as const;

export const MCP_CONFIG = `{
  "mcpServers": {
    "contextosai": {
      "command": "contextosai",
      "args": ["mcp"],
      "env": {
        "CONTEXTOS_ROOT": "\${workspaceFolder}"
      }
    }
  }
}`;

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Install once',
    command: COMMANDS.install,
    detail: 'One global CLI. Works in every project on your machine.',
  },
  {
    step: '02',
    title: 'Initialize & index',
    command: COMMANDS.initAndIndex,
    detail: 'Builds .contextos/ — SQLite, vectors, rules, and agent exports.',
  },
  {
    step: '03',
    title: 'Code like you have a senior dev in the room',
    command: COMMANDS.watch,
    detail: 'Memory updates as you type. Cursor always knows your codebase.',
  },
] as const;

export const CLI_REFERENCE = [
  { cmd: COMMANDS.init, desc: 'Initialize .contextos/ in your repo' },
  { cmd: COMMANDS.index, desc: 'Index files, embed vectors, export rules' },
  { cmd: COMMANDS.watch, desc: 'Re-index on file changes' },
  { cmd: COMMANDS.search, desc: 'Semantic search across indexed files' },
  { cmd: COMMANDS.dashboard, desc: 'Open local dashboard at localhost:3000' },
  { cmd: COMMANDS.export, desc: 'Regenerate .cursor/rules/contextos.mdc + AGENTS.md' },
  { cmd: COMMANDS.mcp, desc: 'Start MCP server for Cursor' },
] as const;
