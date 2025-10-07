/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['localhost'],
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