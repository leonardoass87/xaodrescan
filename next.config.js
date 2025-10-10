/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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