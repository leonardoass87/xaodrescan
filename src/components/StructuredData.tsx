import Script from 'next/script';

interface MangaStructuredDataProps {
  manga: {
    id: number;
    titulo: string;
    autor: string;
    generos: string[];
    status: string;
    capa: string;
    descricao?: string;
    visualizacoes: number;
    dataAdicao: string;
    capitulos: Array<{
      id: number;
      numero: number;
      titulo: string;
      data_publicacao: string;
    }>;
  };
}

export default function MangaStructuredData({ manga }: MangaStructuredDataProps) {
  const statusMap = {
    'em_andamento': 'Ongoing',
    'completo': 'Completed',
    'pausado': 'OnHold'
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": manga.titulo,
    "author": {
      "@type": "Person",
      "name": manga.autor
    },
    "description": manga.descricao || `Leia ${manga.titulo} online grátis no XAODRESCAN`,
    "image": manga.capa.startsWith('/') ? `https://xaodrescan.mangazinho.site${manga.capa}` : manga.capa,
    "url": `https://xaodrescan.mangazinho.site/manga/${manga.id}`,
    "genre": manga.generos,
    "bookFormat": "GraphicNovel",
    "inLanguage": "pt-BR",
    "publisher": {
      "@type": "Organization",
      "name": "XAODRESCAN",
      "url": "https://xaodrescan.mangazinho.site"
    },
    "datePublished": manga.dataAdicao,
    "dateModified": manga.capitulos.length > 0 ? 
      manga.capitulos.sort((a, b) => new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime())[0].data_publicacao : 
      manga.dataAdicao,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": manga.visualizacoes,
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "XAODRESCAN",
      "url": "https://xaodrescan.mangazinho.site"
    }
  };

  return (
    <Script
      id="manga-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "XAODRESCAN",
    "url": "https://xaodrescan.mangazinho.site",
    "description": "Leia mangás online grátis no XAODRESCAN. Milhares de mangás em português, atualizações diárias e interface otimizada para leitura.",
    "inLanguage": "pt-BR",
    "publisher": {
      "@type": "Organization",
      "name": "XAODRESCAN",
      "url": "https://xaodrescan.mangazinho.site"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://xaodrescan.mangazinho.site/catalogo?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}
