/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['localhost', 'xaodrescan.mangazinho.site'],
    formats: ['image/webp', 'image/avif'],
  },
  // Configurações para uploads grandes (Next.js 15+)
  // As configurações de bodyParser agora são feitas nos Route Handlers
  // Otimizações de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/contexts', '@/hooks'],
  },
  // Compressão
  compress: true,
  // Cache otimizado
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Headers para SEO e Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/image/:path*',
        destination: '/image/:path*',
      },
    ];
  },
};

module.exports = nextConfig;