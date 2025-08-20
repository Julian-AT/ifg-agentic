import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      '@codemirror/view',
      '@codemirror/state',
    ],
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate vendor chunks for better caching
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
            chunks: 'all',
          },
          // Separate UI components chunk
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 20,
            reuseExistingChunk: true,
            chunks: 'all',
          },
          // Heavy libraries chunk
          heavy: {
            test: /[\\/]node_modules[\\/](framer-motion|recharts|prosemirror-.*|codemirror)[\\/]/,
            name: 'heavy-libs',
            priority: 30,
            reuseExistingChunk: true,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  // Static optimization
  trailingSlash: false,
};

export default nextConfig;