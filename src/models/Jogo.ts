// Interface Jogo removida - informações agora estão no Grupo

export interface Rodada {
  id?: number;
  grupo_id: number;
  data: string;
  quantidade_times?: number; // 2, 3, 4, 5 ou N
  tipo_divisao?: 'sorteio' | 'manual';
  formato_tipo?: 'tempo' | 'gols' | 'tempos'; // Tipo de formato do jogo
  formato_valor?: number; // minutos (se tipo='tempo'), gols (se tipo='gols'), minutos por tempo (se tipo='tempos')
  quantidade_tempos?: number; // apenas se formato_tipo='tempos'
  created_at?: string;
  updated_at?: string;
}

export interface Confirmacao {
  id?: number;
  associado_id: number;
  rodada_id: number;
  confirmado: boolean;
  confirmado_em?: string;
}

export interface Presenca {
  id?: number;
  associado_id: number;
  rodada_id: number;
  presente: boolean;
  checkin_em?: string;
}

export interface TimeRodada {
  id?: number;
  rodada_id: number;
  associado_id: number;
  time: string; // 'A', 'B', 'C', 'D', etc.
  is_goleiro?: boolean; // Sinalização especial para goleiro
}

export interface ResultadoRodada {
  id?: number;
  rodada_id: number;
  time_nome: string;
  gols: number;
}

export interface EstatisticaRodada {
  id?: number;
  associado_id: number;
  rodada_id: number;
  gols: number;
  assistencias: number;
  cartao_amarelo: number;
  cartao_azul: number;
  cartao_vermelho: number;
  cartao_azul_vermelho: number;
}

export interface Eleicao {
  id?: number;
  rodada_id: number;
  tipo: 'craque' | 'abacaxi' | 'melhor_goleiro';
  associado_id: number;
  votos: number;
}

export interface GolMaisBonito {
  id?: number;
  rodada_id: number;
  associado_id: number;
  descricao?: string;
  votos: number;
}

export interface Partida {
  id?: number;
  rodada_id: number;
  numero: number; // Número da partida (1, 2, 3...)
  inicio_em?: string;
  fim_em?: string;
  created_at?: string;
}

export interface TimePartida {
  id?: number;
  partida_id: number;
  associado_id: number;
  time: string; // 'A', 'B', 'C', 'D', etc.
  is_goleiro?: boolean; // Sinalização especial para goleiro
}

export interface ResultadoPartida {
  id?: number;
  partida_id: number;
  time_nome: string;
  gols: number;
}

export interface EstatisticaPartida {
  id?: number;
  associado_id: number;
  partida_id: number;
  gols: number;
  assistencias: number;
  cartao_amarelo: number;
  cartao_azul: number;
  cartao_vermelho: number;
  cartao_azul_vermelho: number;
}
