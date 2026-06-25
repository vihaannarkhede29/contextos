import type { NextConfig } from 'next';

const nativeExternals = [
  '@contextos/core',
  '@contextos/core/database',
  '@contextos/core/config',
  '@contextos/core/search',
  'better-sqlite3',
  '@lancedb/lancedb',
  '@xenova/transformers',
  'onnxruntime-node',
  'sharp',
  'tree-sitter',
  'web-tree-sitter',
];

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@contextos/shared'],
  serverExternalPackages: nativeExternals,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), ...nativeExternals];
    }
    return config;
  },
};

export default nextConfig;
