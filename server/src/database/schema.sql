-- Tabela de Associados
CREATE TABLE IF NOT EXISTS associados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  apelido TEXT NOT NULL UNIQUE,
  posicao TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Grupos (contém informações de jogo)
CREATE TABLE IF NOT EXISTS grupos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  local TEXT,
  dia_semana INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  horario_inicio TEXT NOT NULL, -- Ex: "08:00"
  horario_fim TEXT NOT NULL, -- Ex: "10:00"
  periodicidade TEXT DEFAULT 'semanal', -- 'semanal', 'quinzenal', 'mensal'
  quantidade_jogadores_linha INTEGER DEFAULT 10, -- Quantidade de jogadores de linha por time (ex: 6 para campo de 6)
  quantidade_minima_jogadores INTEGER DEFAULT 12, -- Mínimo para formar times (ex: 12 para 2 times de 6)
  quantidade_maxima_jogadores INTEGER DEFAULT 24, -- Máximo de jogadores (ex: 24 para 4 times de 6)
  tipo_time TEXT DEFAULT 'dinamico',
  link_convite TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Rodadas (Instâncias de partidas do grupo)
CREATE TABLE IF NOT EXISTS rodadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  data DATE NOT NULL,
  quantidade_times INTEGER DEFAULT 2,
  tipo_divisao TEXT DEFAULT 'sorteio',
  formato_tipo TEXT DEFAULT 'tempo', -- 'tempo', 'gols', 'tempos'
  formato_valor INTEGER, -- minutos (se tipo='tempo'), gols (se tipo='gols'), minutos por tempo (se tipo='tempos')
  quantidade_tempos INTEGER, -- apenas se formato_tipo='tempos'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
);

-- Tabela de Confirmações (Check-in antes da rodada)
CREATE TABLE IF NOT EXISTS confirmacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  associado_id INTEGER NOT NULL,
  rodada_id INTEGER NOT NULL,
  confirmado BOOLEAN DEFAULT 0,
  confirmado_em DATETIME,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(associado_id, rodada_id)
);

-- Tabela de Presenças (Check-in no dia da rodada)
CREATE TABLE IF NOT EXISTS presencas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  associado_id INTEGER NOT NULL,
  rodada_id INTEGER NOT NULL,
  presente BOOLEAN DEFAULT 0,
  checkin_em DATETIME,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(associado_id, rodada_id)
);

-- Tabela de Times da Rodada (divisão inicial de todos que fizeram check-in)
CREATE TABLE IF NOT EXISTS times_rodada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rodada_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  time TEXT NOT NULL,
  is_goleiro BOOLEAN DEFAULT 0, -- Sinalização especial para goleiro
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(associado_id, rodada_id)
);

-- Tabela de Partidas (múltiplas partidas dentro de uma rodada para formato tempo/gols)
CREATE TABLE IF NOT EXISTS partidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rodada_id INTEGER NOT NULL,
  numero INTEGER NOT NULL, -- Número da partida (1, 2, 3...)
  inicio_em DATETIME,
  fim_em DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(rodada_id, numero)
);

-- Tabela de Times por Partida (times podem mudar entre partidas)
CREATE TABLE IF NOT EXISTS times_partida (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partida_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  time TEXT NOT NULL,
  is_goleiro BOOLEAN DEFAULT 0, -- Sinalização especial para goleiro
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (partida_id) REFERENCES partidas(id),
  UNIQUE(associado_id, partida_id)
);

-- Tabela de Resultados da Partida
CREATE TABLE IF NOT EXISTS resultados_partida (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partida_id INTEGER NOT NULL,
  time_nome TEXT NOT NULL,
  gols INTEGER DEFAULT 0,
  FOREIGN KEY (partida_id) REFERENCES partidas(id),
  UNIQUE(partida_id, time_nome)
);

-- Tabela de Resultados da Rodada (mantida para compatibilidade com formato "tempos")
CREATE TABLE IF NOT EXISTS resultados_rodada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rodada_id INTEGER NOT NULL,
  time_nome TEXT NOT NULL,
  gols INTEGER DEFAULT 0,
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(rodada_id, time_nome)
);

-- Tabela de Estatísticas por Partida
CREATE TABLE IF NOT EXISTS estatisticas_partida (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  associado_id INTEGER NOT NULL,
  partida_id INTEGER NOT NULL,
  gols INTEGER DEFAULT 0,
  assistencias INTEGER DEFAULT 0,
  cartao_amarelo INTEGER DEFAULT 0,
  cartao_azul INTEGER DEFAULT 0,
  cartao_vermelho INTEGER DEFAULT 0,
  cartao_azul_vermelho INTEGER DEFAULT 0,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (partida_id) REFERENCES partidas(id),
  UNIQUE(associado_id, partida_id)
);

-- Tabela de Estatísticas por Rodada (mantida para compatibilidade)
CREATE TABLE IF NOT EXISTS estatisticas_rodada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  associado_id INTEGER NOT NULL,
  rodada_id INTEGER NOT NULL,
  gols INTEGER DEFAULT 0,
  assistencias INTEGER DEFAULT 0,
  cartao_amarelo INTEGER DEFAULT 0,
  cartao_azul INTEGER DEFAULT 0,
  cartao_vermelho INTEGER DEFAULT 0,
  cartao_azul_vermelho INTEGER DEFAULT 0,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(associado_id, rodada_id)
);

-- Tabela de Eleições da Rodada
CREATE TABLE IF NOT EXISTS eleicoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rodada_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  associado_id INTEGER NOT NULL,
  votos INTEGER DEFAULT 0,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(rodada_id, tipo, associado_id)
);

-- Tabela de Gols Mais Bonitos
CREATE TABLE IF NOT EXISTS gols_mais_bonitos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rodada_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  descricao TEXT,
  votos INTEGER DEFAULT 0,
  FOREIGN KEY (associado_id) REFERENCES associados(id),
  FOREIGN KEY (rodada_id) REFERENCES rodadas(id),
  UNIQUE(rodada_id, associado_id)
);

-- Tabela de Responsáveis do Grupo (muitos para muitos)
CREATE TABLE IF NOT EXISTS grupo_responsaveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (associado_id) REFERENCES associados(id) ON DELETE CASCADE,
  UNIQUE(grupo_id, associado_id)
);

-- Tabela de Associados do Grupo (muitos para muitos)
CREATE TABLE IF NOT EXISTS grupo_associados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  status TEXT DEFAULT 'ativo',
  criado_via TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (associado_id) REFERENCES associados(id) ON DELETE CASCADE,
  UNIQUE(grupo_id, associado_id)
);

-- Tabela de Solicitações de Entrada no Grupo
CREATE TABLE IF NOT EXISTS solicitacoes_grupo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  associado_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente',
  mensagem TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (associado_id) REFERENCES associados(id) ON DELETE CASCADE,
  UNIQUE(grupo_id, associado_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_confirmacoes_associado ON confirmacoes(associado_id);
CREATE INDEX IF NOT EXISTS idx_confirmacoes_rodada ON confirmacoes(rodada_id);
CREATE INDEX IF NOT EXISTS idx_presencas_associado ON presencas(associado_id);
CREATE INDEX IF NOT EXISTS idx_presencas_rodada ON presencas(rodada_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_associado ON estatisticas_rodada(associado_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_rodada ON estatisticas_rodada(rodada_id);
CREATE INDEX IF NOT EXISTS idx_partidas_rodada ON partidas(rodada_id);
CREATE INDEX IF NOT EXISTS idx_times_partida ON times_partida(partida_id);
CREATE INDEX IF NOT EXISTS idx_resultados_partida ON resultados_partida(partida_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_partida ON estatisticas_partida(partida_id);
CREATE INDEX IF NOT EXISTS idx_rodadas_data ON rodadas(data);
CREATE INDEX IF NOT EXISTS idx_rodadas_grupo ON rodadas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_responsaveis_grupo ON grupo_responsaveis(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_responsaveis_associado ON grupo_responsaveis(associado_id);
CREATE INDEX IF NOT EXISTS idx_grupo_associados_grupo ON grupo_associados(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_associados_associado ON grupo_associados(associado_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_grupo ON solicitacoes_grupo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_associado ON solicitacoes_grupo(associado_id);

