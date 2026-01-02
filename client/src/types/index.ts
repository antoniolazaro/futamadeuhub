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

export interface Rodada {
  id?: number;
  grupo_id: number;
  data: string;
  quantidade_times?: number;
  tipo_divisao?: 'sorteio' | 'manual';
  formato_tipo?: 'tempo' | 'gols' | 'tempos';
  formato_valor?: number;
  quantidade_tempos?: number;
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
  time: string;
  is_goleiro?: boolean;
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
  numero: number;
  inicio_em?: string;
  fim_em?: string;
  created_at?: string;
}

export interface TimePartida {
  id?: number;
  partida_id: number;
  associado_id: number;
  time: string;
  is_goleiro?: boolean;
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

export interface RankingGrupo {
  associado_id: number;
  nome: string;
  apelido: string;
  posicao: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols: number;
  assistencias: number;
  media_gols: number;
  aproveitamento: number;
  frequencia: number;
  cartoes_amarelos: number;
  cartoes_azuis: number;
  cartoes_vermelhos: number;
  cartoes_azul_vermelho: number;
}

export interface Grupo {
  id?: number;
  nome: string;
  descricao?: string;
  local?: string;
  dia_semana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horario_inicio: string;
  horario_fim: string;
  periodicidade?: 'semanal' | 'quinzenal' | 'mensal';
  quantidade_jogadores_linha?: number; // Quantidade de jogadores de linha por time (ex: 6)
  quantidade_minima_jogadores?: number; // Mínimo para formar times (ex: 12 para 2 times de 6)
  quantidade_maxima_jogadores?: number; // Máximo de jogadores (ex: 24 para 4 times de 6)
  tipo_time?: 'fixo' | 'dinamico';
  link_convite?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GrupoCompleto extends Grupo {
  responsaveis?: AssociadoGrupo[];
  associados?: AssociadoGrupo[];
}

export interface AssociadoGrupo {
  id?: number;
  associado_id: number;
  grupo_id: number;
  status?: 'ativo' | 'pendente' | 'rejeitado';
  criado_via?: 'convite' | 'solicitacao';
  created_at?: string;
  associado?: {
    id: number;
    nome: string;
    apelido: string;
    posicao: string;
  };
}

export interface SolicitacaoGrupo {
  id?: number;
  grupo_id: number;
  associado_id: number;
  status?: 'pendente' | 'aprovada' | 'rejeitada';
  mensagem?: string;
  created_at?: string;
  updated_at?: string;
  associado?: {
    id: number;
    nome: string;
    apelido: string;
    posicao: string;
  };
  grupo?: {
    id: number;
    nome: string;
  };
}
