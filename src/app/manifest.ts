import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XAODRESCAN - Leia Mangás Online',
    short_name: 'XAODRESCAN',
    description: 'Leia mangás online grátis no XAODRESCAN. Milhares de mangás em português, atualizações diárias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#dc2626',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['entertainment', 'books', 'lifestyle'],
    lang: 'pt-BR',
    orientation: 'portrait',
  };
}
