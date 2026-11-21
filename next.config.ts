import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents:false,
  devIndicators: false,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  allowedDevOrigins: [
    // Preview hosts are subdomains of these; a bare "*" is rejected by Next.
    "**.e2b.app",
    "**.e2b.dev",
    "**.ideavo.ai",
    "**.ideavo.dev",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        condition: {
          all: [
            { not: 'foreign' },
            // react-three-fiber elements crash when given extra DOM props
            { not: { path: /src\/components\/three\// } },
          ],
        },
        loaders: [require.resolve('@ideavo/webpack-tagger')],
      },
    },
  },
} as NextConfig;

export default nextConfig;
