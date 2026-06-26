import type { NextConfig } from 'next';

const nativeExternals = [
  '@contextosai/core',
  '@contextosai/core/database',
  '@contextosai/core/config',
  '@contextosai/core/search',
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
  transpilePackages: ['@contextosai/shared'],
  serverExternalPackages: nativeExternals,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), ...nativeExternals];
    }
    return config;
  },
};

export default nextConfig;
