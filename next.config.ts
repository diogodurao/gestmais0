import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.67", "192.168.1.67:3000"],

  // Enable SWC minification for smaller bundles
  swcMinify: true,

  // Optimize heavy package imports for tree-shaking
  optimizePackageImports: [
    'lucide-react',
    'recharts',
    '@stripe/stripe-js',
    'date-fns',
  ],

  // Enable gzip compression
  compress: true,

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.1.67:3000"],
    },
  },

  // Add response headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        // Dashboard pages: use 'private, no-cache' instead of 'no-store'
        // This allows bfcache while still requiring revalidation
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
