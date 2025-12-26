import { initDatabase, dbRun, dbGet, dbAll } from "../database/db";

interface AssociadoFake {
  nome: string;
  apelido: string;
  posicao: string;
}

interface GrupoFake {
  nome: string;
  descricao: string;
  local: string;
  dia_semana: number; // 0=Domingo, 1=Segunda, ..., 6=Sábado
  horario_inicio: string;
  horario_fim: string;
  periodicidade: "semanal" | "quinzenal" | "mensal";
  quantidade_jogadores_linha: number;
  quantidade_minima_jogadores: number;
  quantidade_maxima_jogadores: number;
  tipo_time: "fixo" | "dinamico";
}

async function popularDadosFake() {
  try {
    console.log("Inicializando banco de dados...");
    await initDatabase();

    console.log("Criando associados...");
    const associadosFake: AssociadoFake[] = [
      { nome: "João Silva", apelido: "João", posicao: "Goleiro" },
      { nome: "Pedro Santos", apelido: "Pedro", posicao: "Zagueiro" },
      { nome: "Carlos Oliveira", apelido: "Carlos", posicao: "Zagueiro" },
      { nome: "Lucas Ferreira", apelido: "Lucas", posicao: "Lateral" },
      { nome: "Marcos Costa", apelido: "Marcos", posicao: "Lateral" },
      { nome: "Rafael Alves", apelido: "Rafa", posicao: "Volante" },
      { nome: "Bruno Lima", apelido: "Bruno", posicao: "Volante" },
      { nome: "Felipe Souza", apelido: "Felipe", posicao: "Meia" },
      { nome: "Gabriel Martins", apelido: "Gabriel", posicao: "Meia" },
      { nome: "Thiago Rocha", apelido: "Thiago", posicao: "Meia" },
      { nome: "André Pereira", apelido: "André", posicao: "Atacante" },
      { nome: "Ricardo Barbosa", apelido: "Ricardo", posicao: "Atacante" },
      { nome: "Daniel Cardoso", apelido: "Daniel", posicao: "Atacante" },
      { nome: "Eduardo Ribeiro", apelido: "Eduardo", posicao: "Goleiro" },
      { nome: "Fernando Araújo", apelido: "Fernando", posicao: "Zagueiro" },
    ];

    const associadosIds: number[] = [];
    for (const assoc of associadosFake) {
      await dbRun(
        "INSERT OR IGNORE INTO associados (nome, apelido, posicao) VALUES (?, ?, ?)",
        [assoc.nome, assoc.apelido, assoc.posicao]
      );
      const associado = (await dbGet(
        "SELECT id FROM associados WHERE apelido = ?",
        [assoc.apelido]
      )) as { id: number } | null;
      if (associado) {
        associadosIds.push(associado.id);
      }
    }
    console.log(`✓ ${associadosIds.length} associados criados`);

    console.log("Criando grupos...");
    const gruposFake: GrupoFake[] = [
      {
        nome: "Pelada do Sábado",
        descricao: "Pelada semanal aos sábados de manhã",
        local: "Campo do Bairro",
        dia_semana: 6, // Sábado
        horario_inicio: "08:00",
        horario_fim: "10:00",
        periodicidade: "semanal",
        quantidade_jogadores_linha: 6, // Campo de 6
        quantidade_minima_jogadores: 12, // Mínimo para 2 times de 6
        quantidade_maxima_jogadores: 24, // Máximo para 4 times de 6
        tipo_time: "fixo",
      },
      {
        nome: "Futebol da Tarde",
        descricao: "Jogos quinzenais nas tardes de domingo",
        local: "Quadra Coberta",
        dia_semana: 0, // Domingo
        horario_inicio: "16:00",
        horario_fim: "18:00",
        periodicidade: "quinzenal",
        quantidade_jogadores_linha: 5, // Campo de 5
        quantidade_minima_jogadores: 10, // Mínimo para 2 times de 5
        quantidade_maxima_jogadores: 20, // Máximo para 4 times de 5
        tipo_time: "dinamico",
      },
      {
        nome: "Pelada Mensal",
        descricao: "Encontro mensal para jogar",
        local: "Campo Principal",
        dia_semana: 0, // Domingo
        horario_inicio: "10:00",
        horario_fim: "12:00",
        periodicidade: "mensal",
        quantidade_jogadores_linha: 6, // Campo de 6
        quantidade_minima_jogadores: 12, // Mínimo para 2 times de 6
        quantidade_maxima_jogadores: 24, // Máximo para 4 times de 6
        tipo_time: "fixo",
      },
    ];

    const gruposIds: number[] = [];
    for (const grupo of gruposFake) {
      const linkConvite = Math.random().toString(36).substring(2, 18);
      await dbRun(
        `INSERT OR IGNORE INTO grupos (nome, descricao, local, dia_semana, horario_inicio, horario_fim, periodicidade, quantidade_jogadores_linha, quantidade_minima_jogadores, quantidade_maxima_jogadores, tipo_time, link_convite) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          grupo.nome,
          grupo.descricao,
          grupo.local,
          grupo.dia_semana,
          grupo.horario_inicio,
          grupo.horario_fim,
          grupo.periodicidade,
          grupo.quantidade_jogadores_linha,
          grupo.quantidade_minima_jogadores,
          grupo.quantidade_maxima_jogadores,
          grupo.tipo_time,
          linkConvite,
        ]
      );
      const grupoCriado = (await dbGet(
        "SELECT id, link_convite FROM grupos WHERE nome = ?",
        [grupo.nome]
      )) as { id: number; link_convite: string } | null;
      if (grupoCriado) {
        gruposIds.push(grupoCriado.id);
        console.log(`  ✓ ${grupo.nome} - Link: ${grupoCriado.link_convite}`);
      }
    }
    console.log(`✓ ${gruposIds.length} grupos criados`);

    console.log("Adicionando responsáveis aos grupos...");
    if (gruposIds[0] && associadosIds[0]) {
      await dbRun(
        "INSERT OR IGNORE INTO grupo_responsaveis (grupo_id, associado_id) VALUES (?, ?)",
        [gruposIds[0], associadosIds[0]]
      );
    }
    if (gruposIds[1] && associadosIds[1] && associadosIds[2]) {
      await dbRun(
        "INSERT OR IGNORE INTO grupo_responsaveis (grupo_id, associado_id) VALUES (?, ?)",
        [gruposIds[1], associadosIds[1]]
      );
      await dbRun(
        "INSERT OR IGNORE INTO grupo_responsaveis (grupo_id, associado_id) VALUES (?, ?)",
        [gruposIds[1], associadosIds[2]]
      );
    }
    console.log("✓ Responsáveis adicionados");

    console.log("Adicionando associados aos grupos...");
    for (let i = 0; i < 8 && i < associadosIds.length; i++) {
      await dbRun(
        "INSERT OR IGNORE INTO grupo_associados (grupo_id, associado_id, status, criado_via) VALUES (?, ?, 'ativo', 'convite')",
        [gruposIds[0], associadosIds[i]]
      );
    }
    for (let i = 5; i < 12 && i < associadosIds.length; i++) {
      await dbRun(
        "INSERT OR IGNORE INTO grupo_associados (grupo_id, associado_id, status, criado_via) VALUES (?, ?, 'ativo', 'solicitacao')",
        [gruposIds[1], associadosIds[i]]
      );
    }
    for (let i = 10; i < associadosIds.length; i++) {
      await dbRun(
        "INSERT OR IGNORE INTO grupo_associados (grupo_id, associado_id, status, criado_via) VALUES (?, ?, 'ativo', 'convite')",
        [gruposIds[2], associadosIds[i]]
      );
    }
    console.log("✓ Associados adicionados aos grupos");

    console.log("Criando rodadas...");
    const hoje = new Date();
    const rodadas: Array<{
      grupo_id: number;
      data: string;
      quantidade_times: number;
      tipo_divisao: string;
      formato_tipo: string;
      formato_valor: number;
    }> = [];

    // Rodadas do primeiro grupo (semanal) - últimas 4 semanas
    for (let i = 0; i < 4; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i * 7);
      rodadas.push({
        grupo_id: gruposIds[0],
        data: data.toISOString().split("T")[0],
        quantidade_times: 2,
        tipo_divisao: "sorteio",
        formato_tipo: "tempo",
        formato_valor: 60, // 60 minutos
      });
    }

    // Rodadas do segundo grupo (quinzenal) - últimas 2 quinzenas
    for (let i = 0; i < 2; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i * 14);
      rodadas.push({
        grupo_id: gruposIds[1],
        data: data.toISOString().split("T")[0],
        quantidade_times: 2,
        tipo_divisao: "sorteio",
        formato_tipo: "tempos",
        formato_valor: 20, // 20 minutos por tempo
      });
    }

    // Rodada do terceiro grupo (mensal)
    const dataMensal = new Date(hoje);
    dataMensal.setMonth(dataMensal.getMonth() - 1);
    rodadas.push({
      grupo_id: gruposIds[2],
      data: dataMensal.toISOString().split("T")[0],
      quantidade_times: 2,
      tipo_divisao: "sorteio",
      formato_tipo: "gols",
      formato_valor: 10, // até 10 gols
    });

    const rodadasIds: number[] = [];
    for (const rodada of rodadas) {
      const result = await dbRun(
        "INSERT OR IGNORE INTO rodadas (grupo_id, data, quantidade_times, tipo_divisao, formato_tipo, formato_valor) VALUES (?, ?, ?, ?, ?, ?)",
        [
          rodada.grupo_id,
          rodada.data,
          rodada.quantidade_times,
          rodada.tipo_divisao,
          rodada.formato_tipo,
          rodada.formato_valor,
        ]
      );
      const rodadaCriada = (await dbGet(
        "SELECT id FROM rodadas WHERE grupo_id = ? AND data = ?",
        [rodada.grupo_id, rodada.data]
      )) as { id: number } | null;
      if (rodadaCriada) {
        rodadasIds.push(rodadaCriada.id);
      }
    }
    console.log(`✓ ${rodadasIds.length} rodadas criadas`);

    console.log("Criando confirmações e presenças...");
    for (const rodadaId of rodadasIds) {
      const rodada = (await dbGet("SELECT grupo_id FROM rodadas WHERE id = ?", [
        rodadaId,
      ])) as { grupo_id: number } | null;
      if (!rodada) continue;

      const associadosGrupo = (await dbAll(
        "SELECT associado_id FROM grupo_associados WHERE grupo_id = ? AND status = 'ativo'",
        [rodada.grupo_id]
      )) as Array<{ associado_id: number }>;

      for (const assocGrupo of associadosGrupo) {
        const associadoId = assocGrupo.associado_id;
        const confirmado = Math.random() > 0.2;
        if (confirmado) {
          await dbRun(
            "INSERT OR IGNORE INTO confirmacoes (associado_id, rodada_id, confirmado, confirmado_em) VALUES (?, ?, 1, CURRENT_TIMESTAMP)",
            [associadoId, rodadaId]
          );

          const presente = Math.random() > 0.1;
          if (presente) {
            await dbRun(
              "INSERT OR IGNORE INTO presencas (associado_id, rodada_id, presente, checkin_em) VALUES (?, ?, 1, CURRENT_TIMESTAMP)",
              [associadoId, rodadaId]
            );
          }
        }
      }
    }
    console.log("✓ Confirmações e presenças criadas");

    console.log("Criando times para rodadas...");
    for (const rodadaId of rodadasIds) {
      const presentes = (await dbAll(
        "SELECT associado_id FROM presencas WHERE rodada_id = ? AND presente = 1",
        [rodadaId]
      )) as Array<{ associado_id: number }>;

      if (presentes.length === 0) continue;

      const embaralhados = [...presentes].sort(() => Math.random() - 0.5);
      embaralhados.forEach((presenca, index) => {
        const time = String.fromCharCode(65 + (index % 2)); // A ou B
        dbRun(
          "INSERT OR IGNORE INTO times_rodada (rodada_id, associado_id, time) VALUES (?, ?, ?)",
          [rodadaId, presenca.associado_id, time]
        );
      });
    }
    console.log("✓ Times criados");

    console.log("Criando resultados das rodadas...");
    for (const rodadaId of rodadasIds) {
      const times = (await dbAll(
        "SELECT DISTINCT time FROM times_rodada WHERE rodada_id = ?",
        [rodadaId]
      )) as Array<{ time: string }>;

      if (times.length === 0) continue;

      for (const timeInfo of times) {
        const gols = Math.floor(Math.random() * 5);
        await dbRun(
          "INSERT OR IGNORE INTO resultados_rodada (rodada_id, time_nome, gols) VALUES (?, ?, ?)",
          [rodadaId, timeInfo.time, gols]
        );
      }
    }
    console.log("✓ Resultados criados");

    console.log("Criando estatísticas das rodadas...");
    for (const rodadaId of rodadasIds) {
      const presentes = (await dbAll(
        "SELECT associado_id FROM presencas WHERE rodada_id = ? AND presente = 1",
        [rodadaId]
      )) as Array<{ associado_id: number }>;

      for (const presenca of presentes) {
        const gols = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
        const assistencias =
          Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0;
        const cartaoAmarelo = Math.random() > 0.9 ? 1 : 0;
        const cartaoAzul = Math.random() > 0.95 ? 1 : 0;
        const cartaoVermelho = Math.random() > 0.98 ? 1 : 0;
        const cartaoAzulVermelho = 0;

        await dbRun(
          `INSERT OR IGNORE INTO estatisticas_rodada 
           (associado_id, rodada_id, gols, assistencias, cartao_amarelo, cartao_azul, cartao_vermelho, cartao_azul_vermelho) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            presenca.associado_id,
            rodadaId,
            gols,
            assistencias,
            cartaoAmarelo,
            cartaoAzul,
            cartaoVermelho,
            cartaoAzulVermelho,
          ]
        );
      }
    }
    console.log("✓ Estatísticas criadas");

    console.log("Criando algumas solicitações pendentes...");
    for (let i = 10; i < 13 && i < associadosIds.length; i++) {
      await dbRun(
        "INSERT OR IGNORE INTO solicitacoes_grupo (grupo_id, associado_id, status, mensagem) VALUES (?, ?, 'pendente', ?)",
        [
          gruposIds[0],
          associadosIds[i],
          `Quero participar do grupo ${gruposFake[0].nome}`,
        ]
      );
    }
    console.log("✓ Solicitações criadas");

    console.log("\n✅ Dados fake criados com sucesso!");
    console.log("\n📋 Resumo:");
    console.log(`   - ${associadosIds.length} associados`);
    console.log(`   - ${gruposIds.length} grupos`);
    console.log(`   - ${rodadasIds.length} rodadas`);
    console.log("\n🔗 Links de convite dos grupos:");
    const gruposComLinks = (await dbAll(
      "SELECT nome, link_convite FROM grupos"
    )) as Array<{ nome: string; link_convite: string }>;
    gruposComLinks.forEach((grupo) => {
      console.log(`   ${grupo.nome}: ${grupo.link_convite}`);
    });
  } catch (error) {
    console.error("Erro ao popular dados fake:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  popularDadosFake()
    .then(() => {
      console.log("\n✅ Script concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro:", error);
      process.exit(1);
    });
}

export { popularDadosFake };
