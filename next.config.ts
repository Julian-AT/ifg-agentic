import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'snyzk9sqnqm7uraj.public.blob.vercel-storage.com'
      }
    ],
  },
};

export default nextConfig;
