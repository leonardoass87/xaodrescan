export interface Manga {
  id: number;
  titulo: string;
  capa: string;
  status: "em_andamento" | "concluido";
  autor?: string;
  generos?: string[];
  visualizacoes?: number;
  dataAdicao?: string;
}

export interface MangasResponse {
  mangas: Manga[];
  total: number;
  pagina: number;
  limite: number;
  temMais: boolean;
}
