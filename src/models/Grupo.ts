export interface Grupo {
  id?: number;
  nome: string;
  descricao?: string;
  local?: string;
  dia_semana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horario_inicio: string; // Ex: "08:00"
  horario_fim: string; // Ex: "10:00"
  periodicidade?: 'semanal' | 'quinzenal' | 'mensal';
  quantidade_jogadores_linha?: number; // Quantidade de jogadores de linha por time (ex: 6)
  quantidade_minima_jogadores?: number; // Mínimo para formar times (ex: 12 para 2 times de 6)
  quantidade_maxima_jogadores?: number; // Máximo de jogadores (ex: 24 para 4 times de 6)
  tipo_time?: "fixo" | "dinamico";
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
  status?: "ativo" | "pendente" | "rejeitado";
  criado_via?: "convite" | "solicitacao";
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
  status?: "pendente" | "aprovada" | "rejeitada";
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
