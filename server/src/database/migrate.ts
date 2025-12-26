import { dbRun, dbGet, dbAll } from "./db";

export async function migrateDatabase() {
  try {
    console.log("Verificando necessidade de migração...");

    // Verificar se a tabela rodadas existe e tem jogo_id
    const rodadasInfo = await dbGet(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='rodadas'"
    ) as { sql: string } | null;

    if (rodadasInfo && rodadasInfo.sql.includes("jogo_id")) {
      console.log("Migrando tabela rodadas de jogo_id para grupo_id...");

      // Verificar se já existe grupo_id
      const columns = await dbAll(
        "PRAGMA table_info(rodadas)"
      ) as Array<{ name: string; type: string }>;

      const hasGrupoId = columns.some((c) => c.name === "grupo_id");
      const hasJogoId = columns.some((c) => c.name === "jogo_id");

      if (hasJogoId && !hasGrupoId) {
        // Verificar se tabela jogos existe para mapear
        const jogosExists = await dbGet(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='jogos'"
        );

        let jogoToGrupo = new Map<number, number>();

        if (jogosExists) {
          // Migrar dados: precisamos mapear jogo_id para grupo_id
          const jogos = await dbAll(
            "SELECT id, grupo_id FROM jogos"
          ) as Array<{ id: number; grupo_id: number }>;

          jogos.forEach((j) => {
            jogoToGrupo.set(j.id, j.grupo_id);
          });
        } else {
          console.log("⚠️  Tabela jogos não existe. Rodadas antigas serão descartadas.");
        }
      } else if (hasGrupoId) {
        // Se já tem grupo_id, verificar se precisa remover constraint UNIQUE
        // Verificar na definição da tabela e nos índices
        const tableSql = rodadasInfo.sql.toLowerCase();
        const hasUniqueInTable = tableSql.includes("unique") && tableSql.includes("grupo_id") && tableSql.includes("data");
        
        const indexes = await dbAll(
          "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='rodadas'"
        ) as Array<{ name: string; sql: string }>;

        const hasUniqueInIndex = indexes.some(
          (idx) => idx.sql && idx.sql.toLowerCase().includes("unique") && idx.sql.toLowerCase().includes("grupo_id") && idx.sql.toLowerCase().includes("data")
        );

        if (hasUniqueInTable || hasUniqueInIndex) {
          console.log("Removendo constraint UNIQUE(grupo_id, data) da tabela rodadas...");
          // SQLite não permite remover UNIQUE diretamente, precisamos recriar a tabela
          const rodadasExistentes = await dbAll("SELECT * FROM rodadas") as any[];

          await dbRun(`
            CREATE TABLE rodadas_temp (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              grupo_id INTEGER NOT NULL,
              data DATE NOT NULL,
              quantidade_times INTEGER DEFAULT 2,
              tipo_divisao TEXT DEFAULT 'sorteio',
              formato_tipo TEXT DEFAULT 'tempo',
              formato_valor INTEGER,
              quantidade_tempos INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (grupo_id) REFERENCES grupos(id)
            )
          `);

          // Copiar dados
          for (const rodada of rodadasExistentes) {
            await dbRun(
              `INSERT INTO rodadas_temp (id, grupo_id, data, quantidade_times, tipo_divisao, formato_tipo, formato_valor, quantidade_tempos, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                rodada.id,
                rodada.grupo_id,
                rodada.data,
                rodada.quantidade_times || 2,
                rodada.tipo_divisao || "sorteio",
                rodada.formato_tipo || "tempo",
                rodada.formato_valor || null,
                rodada.quantidade_tempos || null,
                rodada.created_at,
                rodada.updated_at,
              ]
            );
          }

          await dbRun("DROP TABLE rodadas");
          await dbRun("ALTER TABLE rodadas_temp RENAME TO rodadas");

          // Recriar índices
          await dbRun("CREATE INDEX IF NOT EXISTS idx_rodadas_data ON rodadas(data)");
          await dbRun("CREATE INDEX IF NOT EXISTS idx_rodadas_grupo ON rodadas(grupo_id)");

          console.log("✓ Constraint UNIQUE removida com sucesso");
          return; // Já migrou, não precisa continuar
        }
      }

      if (hasJogoId && !hasGrupoId) {

        // Criar nova tabela rodadas com grupo_id (sem constraint UNIQUE para permitir múltiplas rodadas na mesma data)
        await dbRun(`
          CREATE TABLE rodadas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grupo_id INTEGER NOT NULL,
            data DATE NOT NULL,
            quantidade_times INTEGER DEFAULT 2,
            tipo_divisao TEXT DEFAULT 'sorteio',
            formato_tipo TEXT DEFAULT 'tempo',
            formato_valor INTEGER,
            quantidade_tempos INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (grupo_id) REFERENCES grupos(id)
          )
        `);

        // Migrar dados apenas se tivermos o mapeamento
        if (jogoToGrupo.size > 0) {
          const rodadasAntigas = await dbAll(
            "SELECT * FROM rodadas"
          ) as any[];

          for (const rodada of rodadasAntigas) {
            const grupoId = jogoToGrupo.get(rodada.jogo_id);
            if (grupoId) {
              await dbRun(
                `INSERT INTO rodadas_new (id, grupo_id, data, quantidade_times, tipo_divisao, formato_tipo, formato_valor, quantidade_tempos, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  rodada.id,
                  grupoId,
                  rodada.data,
                  rodada.quantidade_times || 2,
                  rodada.tipo_divisao || "sorteio",
                  rodada.formato_tipo || "tempo",
                  rodada.formato_valor || null,
                  rodada.quantidade_tempos || null,
                  rodada.created_at,
                  rodada.updated_at,
                ]
              );
            }
          }
        }

        // Deletar tabela antiga e renomear nova
        await dbRun("DROP TABLE rodadas");
        await dbRun("ALTER TABLE rodadas_new RENAME TO rodadas");

        // Recriar índices
        await dbRun("CREATE INDEX IF NOT EXISTS idx_rodadas_data ON rodadas(data)");
        await dbRun("CREATE INDEX IF NOT EXISTS idx_rodadas_grupo ON rodadas(grupo_id)");

        console.log("✓ Tabela rodadas migrada com sucesso");
      }
    }

    // Verificar e atualizar tabela grupos se necessário
    const gruposInfo = await dbGet(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='grupos'"
    ) as { sql: string } | null;

    if (gruposInfo) {
      const columns = await dbAll(
        "PRAGMA table_info(grupos)"
      ) as Array<{ name: string; type: string }>;

      const hasDiaSemana = columns.some((c) => c.name === "dia_semana");
      const hasHorarioInicio = columns.some((c) => c.name === "horario_inicio");
      const hasHorarioFim = columns.some((c) => c.name === "horario_fim");
      const hasPeriodicidade = columns.some((c) => c.name === "periodicidade");
      const hasQuantidadeJogadoresLinha = columns.some(
        (c) => c.name === "quantidade_jogadores_linha"
      );
      const hasQuantidadeMinima = columns.some(
        (c) => c.name === "quantidade_minima_jogadores"
      );
      const hasQuantidadeMaxima = columns.some(
        (c) => c.name === "quantidade_maxima_jogadores"
      );

      if (
        !hasDiaSemana ||
        !hasHorarioInicio ||
        !hasHorarioFim ||
        !hasPeriodicidade ||
        !hasQuantidadeJogadoresLinha ||
        !hasQuantidadeMinima ||
        !hasQuantidadeMaxima
      ) {
        console.log("Migrando tabela grupos...");

        // Criar nova tabela grupos
        await dbRun(`
          CREATE TABLE grupos_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            descricao TEXT,
            local TEXT,
            dia_semana INTEGER NOT NULL DEFAULT 0,
            horario_inicio TEXT NOT NULL DEFAULT '08:00',
            horario_fim TEXT NOT NULL DEFAULT '10:00',
            periodicidade TEXT DEFAULT 'semanal',
            quantidade_jogadores_linha INTEGER DEFAULT 10,
            quantidade_minima_jogadores INTEGER DEFAULT 12,
            quantidade_maxima_jogadores INTEGER DEFAULT 24,
            tipo_time TEXT DEFAULT 'dinamico',
            link_convite TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Migrar dados existentes
        const gruposAntigos = await dbAll("SELECT * FROM grupos") as any[];

        for (const grupo of gruposAntigos) {
          const quantidadeJogadoresLinha = grupo.quantidade_jogadores_linha || 10;
          const quantidadeMinima = grupo.quantidade_minima_jogadores || quantidadeJogadoresLinha * 2;
          const quantidadeMaxima = grupo.quantidade_maxima_jogadores || quantidadeJogadoresLinha * 4;
          
          await dbRun(
            `INSERT INTO grupos_new (id, nome, descricao, local, dia_semana, horario_inicio, horario_fim, periodicidade, quantidade_jogadores_linha, quantidade_minima_jogadores, quantidade_maxima_jogadores, tipo_time, link_convite, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              grupo.id,
              grupo.nome,
              grupo.descricao || null,
              grupo.local || null,
              grupo.dia_semana || 0,
              grupo.horario_inicio || "08:00",
              grupo.horario_fim || "10:00",
              grupo.periodicidade || "semanal",
              quantidadeJogadoresLinha,
              quantidadeMinima,
              quantidadeMaxima,
              grupo.tipo_time || "dinamico",
              grupo.link_convite || null,
              grupo.created_at,
              grupo.updated_at,
            ]
          );
        }

        // Deletar tabela antiga e renomear nova
        await dbRun("DROP TABLE grupos");
        await dbRun("ALTER TABLE grupos_new RENAME TO grupos");

        console.log("✓ Tabela grupos migrada com sucesso");
      }
    }

    // Remover tabela jogos se existir
    const jogosExists = await dbGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='jogos'"
    );

    if (jogosExists) {
      console.log("Removendo tabela jogos (não mais necessária)...");
      await dbRun("DROP TABLE IF EXISTS jogos");
      console.log("✓ Tabela jogos removida");
    }

    // Verificar e adicionar campo is_goleiro nas tabelas de times
    const timesRodadaColumns = await dbAll(
      "PRAGMA table_info(times_rodada)"
    ) as Array<{ name: string }>;

    if (!timesRodadaColumns.some((c) => c.name === "is_goleiro")) {
      console.log("Adicionando campo is_goleiro em times_rodada...");
      await dbRun("ALTER TABLE times_rodada ADD COLUMN is_goleiro BOOLEAN DEFAULT 0");
      console.log("✓ Campo is_goleiro adicionado em times_rodada");
    }

    const timesPartidaExists = await dbGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='times_partida'"
    );

    if (timesPartidaExists) {
      const timesPartidaColumns = await dbAll(
        "PRAGMA table_info(times_partida)"
      ) as Array<{ name: string }>;

      if (!timesPartidaColumns.some((c) => c.name === "is_goleiro")) {
        console.log("Adicionando campo is_goleiro em times_partida...");
        await dbRun("ALTER TABLE times_partida ADD COLUMN is_goleiro BOOLEAN DEFAULT 0");
        console.log("✓ Campo is_goleiro adicionado em times_partida");
      }
    }

    console.log("Migração concluída!");
  } catch (error) {
    console.error("Erro na migração:", error);
    throw error;
  }
}

