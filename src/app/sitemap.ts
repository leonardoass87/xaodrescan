import { MetadataRoute } from 'next';
import pool from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://xaodrescan.mangazinho.site';
  
  // Páginas estáticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lancamentos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Páginas dinâmicas de mangás
  let mangaPages: MetadataRoute.Sitemap = [];
  
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, titulo, data_adicao, 
             (SELECT MAX(data_publicacao) FROM capitulos WHERE manga_id = mangas.id) as ultima_atualizacao
      FROM mangas 
      ORDER BY data_adicao DESC
    `);
    client.release();

    mangaPages = result.rows.map((manga: any) => ({
      url: `${baseUrl}/manga/${manga.id}`,
      lastModified: new Date(manga.ultima_atualizacao || manga.data_adicao),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Erro ao gerar sitemap dos mangás:', error);
  }

  return [...staticPages, ...mangaPages];
}
