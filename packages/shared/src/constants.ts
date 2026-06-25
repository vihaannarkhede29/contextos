export const CONTEXTOS_DIR = '.contextos';
export const CONTEXTOS_DB = 'contextos.db';
export const CONTEXTOS_LANCE = 'vectors.lance';
export const PROJECT_MEMORY_FILE = 'project.md';
export const CONFIG_FILE = 'config.json';

export const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.contextos',
  '.turbo',
]);

export const IGNORED_FILE_PATTERNS = [/^\.env/, /\.env\./];

export const SUPPORTED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.go',
  '.java',
  '.md',
  '.mdx',
]);

export const DEFAULT_EMBEDDING_MODEL = 'nomic-embed-text';
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
export const DASHBOARD_PORT = 3000;

export const FRAMEWORK_DEPS: Record<string, string[]> = {
  'Next.js': ['next'],
  React: ['react', 'react-dom'],
  FastAPI: ['fastapi'],
  PostgreSQL: ['pg', 'postgres', '@vercel/postgres'],
  Prisma: ['@prisma/client', 'prisma'],
  'shadcn/ui': ['class-variance-authority', 'clsx', 'tailwind-merge'],
  Zustand: ['zustand'],
  Vitest: ['vitest'],
  Express: ['express'],
  TailwindCSS: ['tailwindcss'],
  'Framer Motion': ['framer-motion'],
};

export const FRAMEWORK_PATTERNS: Record<string, RegExp[]> = {
  'Next.js': [/from ['"]next\//, /import.*from ['"]next['"]/, /"next":/],
  FastAPI: [/from fastapi import/, /FastAPI\(/],
  PostgreSQL: [/postgres(ql)?:\/\//, /from ['"]pg['"]/, /Prisma.*provider.*postgresql/],
  Prisma: [/@prisma\/client/, /prisma schema/],
  'shadcn/ui': [/@\/components\/ui\//, /class-variance-authority/],
  Zustand: [/from ['"]zustand['"]/, /create\(/],
  Vitest: [/from ['"]vitest['"]/, /describe\(/],
  React: [/from ['"]react['"]/, /import React/],
  Express: [/from ['"]express['"]/, /require\(['"]express['"]\)/],
  TailwindCSS: [/tailwindcss/, /@tailwind/],
  'Framer Motion': [/from ['"]framer-motion['"]/],
};
