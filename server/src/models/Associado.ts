export interface Associado {
  id?: number;
  nome: string;
  apelido: string;
  posicao: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssociadoEstatisticas extends Associado {
  total_jogos: number;
  total_pontos: number;
  total_gols: number;
  total_assistencias: number;
  total_vitorias: number;
  total_derrotas: number;
  total_empates: number;
  total_cartoes_amarelos: number;
  total_cartoes_azuis: number;
  total_cartoes_vermelhos: number;
  total_cartoes_azul_vermelho: number;
  media_gols: number;
  aproveitamento_vitoria: number;
  frequencia: number;
  percentual_vitoria: number;
  percentual_derrota: number;
  percentual_empate: number;
  grupos?: Array<{ id: number; nome: string }>;
}





