import { Metadata } from 'next';
import pool from '@/lib/db';

interface MangaData {
  id: number;
  titulo: string;
  autor: string;
  generos: string[];
  status: string;
  capa: string;
  descricao?: string;
  visualizacoes: number;
  data_adicao: string;
}

async function getMangaData(id: string): Promise<MangaData | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM mangas WHERE id = $1',
      [parseInt(id)]
    );
    client.release();
    
    if (result.rows.length === 0) return null;
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar dados do mangá:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const manga = await getMangaData(resolvedParams.id);
  
  if (!manga) {
    return {
      title: 'Mangá não encontrado',
      description: 'O mangá solicitado não foi encontrado.',
    };
  }

  const statusText = {
    'em_andamento': 'Em Andamento',
    'completo': 'Completo',
    'pausado': 'Pausado'
  }[manga.status] || manga.status;

  const title = `${manga.titulo} - ${manga.autor} | XAODRESCAN`;
  const description = manga.descricao || 
    `Leia ${manga.titulo} por ${manga.autor} online grátis no XAODRESCAN. Status: ${statusText}. Gêneros: ${manga.generos.join(', ')}.`;

  return {
    title,
    description,
    keywords: [
      manga.titulo,
      manga.autor,
      ...manga.generos,
      'mangá online',
      'leia grátis',
      'xaodrescan'
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://xaodrescan.mangazinho.site/manga/${manga.id}`,
      images: [
        {
          url: manga.capa.startsWith('/') ? `https://xaodrescan.mangazinho.site${manga.capa}` : manga.capa,
          width: 800,
          height: 1200,
          alt: `Capa de ${manga.titulo}`,
        },
      ],
      publishedTime: manga.data_adicao,
      authors: [manga.autor],
      tags: manga.generos,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [manga.capa.startsWith('/') ? `https://xaodrescan.mangazinho.site${manga.capa}` : manga.capa],
    },
    alternates: {
      canonical: `/manga/${manga.id}`,
    },
    other: {
      'article:author': manga.autor,
      'article:section': manga.generos[0] || 'Mangá',
      'article:tag': manga.generos.join(','),
    },
  };
}

export default function MangaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
