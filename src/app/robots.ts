import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/uploads/temp/',
        '/test-*',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: 'https://xaodrescan.mangazinho.site/sitemap.xml',
    host: 'https://xaodrescan.mangazinho.site',
  };
}
