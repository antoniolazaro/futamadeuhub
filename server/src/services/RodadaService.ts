import { dbRun, dbGet, dbAll } from "../database/db";
import {
  Rodada,
  Confirmacao,
  Presenca,
  TimeRodada,
  ResultadoRodada,
  EstatisticaRodada,
  Eleicao,
  GolMaisBonito,
  Partida,
  TimePartida,
  ResultadoPartida,
  EstatisticaPartida,
} from "../models/Jogo";

export class RodadaService {
  // ========== RODADAS ==========
  async criarRodada(rodada: Rodada): Promise<Rodada> {
    const result = await dbRun(
      "INSERT INTO rodadas (grupo_id, data, quantidade_times, tipo_divisao, formato_tipo, formato_valor, quantidade_tempos) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        rodada.grupo_id,
        rodada.data,
        rodada.quantidade_times || 2,
        rodada.tipo_divisao || "sorteio",
        rodada.formato_tipo || "tempo",
        rodada.formato_valor || null,
        rodada.quantidade_tempos || null,
      ]
    );
    return { ...rodada, id: result.lastID };
  }

  async listarRodadas(filtro?: {
    grupo_id?: number;
    inicio?: string;
    fim?: string;
  }): Promise<Rodada[]> {
    let query = "SELECT r.* FROM rodadas r";
    const params: any[] = [];

    if (filtro?.grupo_id) {
      query += " WHERE r.grupo_id = ?";
      params.push(filtro.grupo_id);
    } else {
      query += " WHERE 1=1";
    }

    if (filtro?.inicio) {
      query += " AND r.data >= ?";
      params.push(filtro.inicio);
    }
    if (filtro?.fim) {
      query += " AND r.data <= ?";
      params.push(filtro.fim);
    }

    query += " ORDER BY r.data DESC";
    return dbAll(query, params) as Promise<Rodada[]>;
  }

  async buscarRodadaPorId(id: number): Promise<Rodada | null> {
    return dbGet("SELECT * FROM rodadas WHERE id = ?", [
      id,
    ]) as Promise<Rodada | null>;
  }

  async confirmarPresenca(confirmacao: Confirmacao): Promise<void> {
    await dbRun(
      "INSERT OR REPLACE INTO confirmacoes (associado_id, rodada_id, confirmado, confirmado_em) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      [
        confirmacao.associado_id,
        confirmacao.rodada_id,
        confirmacao.confirmado ? 1 : 0,
      ]
    );
  }

  async fazerCheckin(presenca: Presenca): Promise<void> {
    await dbRun(
      "INSERT OR REPLACE INTO presencas (associado_id, rodada_id, presente, checkin_em) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      [presenca.associado_id, presenca.rodada_id, presenca.presente ? 1 : 0]
    );
  }

  async listarConfirmacoes(rodadaId: number): Promise<Confirmacao[]> {
    return dbAll("SELECT * FROM confirmacoes WHERE rodada_id = ?", [
      rodadaId,
    ]) as Promise<Confirmacao[]>;
  }

  async listarPresencas(rodadaId: number): Promise<Presenca[]> {
    return dbAll("SELECT * FROM presencas WHERE rodada_id = ?", [
      rodadaId,
    ]) as Promise<Presenca[]>;
  }

  async dividirTimes(
    rodadaId: number,
    divisao: { associado_id: number; time: string; is_goleiro?: boolean }[]
  ): Promise<void> {
    await dbRun("DELETE FROM times_rodada WHERE rodada_id = ?", [rodadaId]);

    for (const item of divisao) {
      await dbRun(
        "INSERT INTO times_rodada (rodada_id, associado_id, time, is_goleiro) VALUES (?, ?, ?, ?)",
        [rodadaId, item.associado_id, item.time, item.is_goleiro ? 1 : 0]
      );
    }
  }

  async sortearTimes(rodadaId: number): Promise<void> {
    const rodada = await this.buscarRodadaPorId(rodadaId);
    if (!rodada) {
      throw new Error("Rodada não encontrada");
    }

    // Buscar informações do grupo
    const grupo = await dbGet(
      "SELECT quantidade_jogadores_linha FROM grupos WHERE id = ?",
      [rodada.grupo_id]
    ) as { quantidade_jogadores_linha: number } | null;

    const quantidadeJogadoresLinha = grupo?.quantidade_jogadores_linha || 10;

    // Buscar presentes com informações de posição
    const presentes = (await dbAll(
      `SELECT p.associado_id, a.posicao 
       FROM presencas p
       JOIN associados a ON p.associado_id = a.id
       WHERE p.rodada_id = ? AND p.presente = 1`,
      [rodadaId]
    )) as { associado_id: number; posicao: string }[];

    if (presentes.length === 0) {
      throw new Error("Nenhum associado presente para sortear times");
    }

    // Separar goleiros dos demais
    const goleiros = presentes.filter((p) => p.posicao.toLowerCase() === "goleiro");
    const jogadoresLinha = presentes.filter((p) => p.posicao.toLowerCase() !== "goleiro");

    // Calcular quantidade de times baseado na quantidade de jogadores de linha
    // Cada time precisa de quantidade_jogadores_linha jogadores de linha
    // Quantidade máxima de times = total jogadores de linha / quantidade_jogadores_linha
    const quantidadeTimesFinal = Math.floor(jogadoresLinha.length / quantidadeJogadoresLinha) || 2;

    if (quantidadeTimesFinal < 2) {
      throw new Error(`Não há jogadores suficientes. Mínimo necessário: ${quantidadeJogadoresLinha * 2} jogadores`);
    }

    // Embaralhar
    const goleirosEmbaralhados = [...goleiros].sort(() => Math.random() - 0.5);
    const jogadoresEmbaralhados = [...jogadoresLinha].sort(() => Math.random() - 0.5);

    const divisao: { associado_id: number; time: string; is_goleiro: boolean }[] = [];

    // Distribuir goleiros primeiro (1 por time, se houver goleiros suficientes)
    goleirosEmbaralhados.forEach((goleiro, index) => {
      if (index < quantidadeTimesFinal) {
        const timeLetra = String.fromCharCode(65 + index); // A, B, C, D...
        divisao.push({
          associado_id: goleiro.associado_id,
          time: timeLetra,
          is_goleiro: true,
        });
      }
    });

    // Distribuir jogadores de linha
    jogadoresEmbaralhados.forEach((jogador, index) => {
      const timeLetra = String.fromCharCode(65 + (index % quantidadeTimesFinal)); // A, B, C, D...
      divisao.push({
        associado_id: jogador.associado_id,
        time: timeLetra,
        is_goleiro: false,
      });
    });

    await this.dividirTimes(rodadaId, divisao);
  }

  async buscarTimesRodada(rodadaId: number): Promise<TimeRodada[]> {
    return dbAll(
      "SELECT * FROM times_rodada WHERE rodada_id = ? ORDER BY time, associado_id",
      [rodadaId]
    ) as Promise<TimeRodada[]>;
  }

  async salvarResultado(resultado: ResultadoRodada): Promise<void> {
    await dbRun(
      "INSERT OR REPLACE INTO resultados_rodada (rodada_id, time_nome, gols) VALUES (?, ?, ?)",
      [resultado.rodada_id, resultado.time_nome, resultado.gols]
    );
  }

  async buscarResultadosRodada(rodadaId: number): Promise<ResultadoRodada[]> {
    return dbAll(
      "SELECT * FROM resultados_rodada WHERE rodada_id = ? ORDER BY time_nome",
      [rodadaId]
    ) as Promise<ResultadoRodada[]>;
  }

  async salvarEstatisticas(estatistica: EstatisticaRodada): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO estatisticas_rodada 
       (associado_id, rodada_id, gols, assistencias, cartao_amarelo, cartao_azul, cartao_vermelho, cartao_azul_vermelho) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estatistica.associado_id,
        estatistica.rodada_id,
        estatistica.gols,
        estatistica.assistencias,
        estatistica.cartao_amarelo,
        estatistica.cartao_azul,
        estatistica.cartao_vermelho,
        estatistica.cartao_azul_vermelho,
      ]
    );
  }

  async buscarEstatisticasRodada(
    rodadaId: number
  ): Promise<EstatisticaRodada[]> {
    return dbAll("SELECT * FROM estatisticas_rodada WHERE rodada_id = ?", [
      rodadaId,
    ]) as Promise<EstatisticaRodada[]>;
  }

  async votarEleicao(eleicao: Eleicao): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO eleicoes (rodada_id, tipo, associado_id, votos) 
       VALUES (?, ?, ?, COALESCE((SELECT votos FROM eleicoes WHERE rodada_id = ? AND tipo = ? AND associado_id = ?), 0) + 1)`,
      [
        eleicao.rodada_id,
        eleicao.tipo,
        eleicao.associado_id,
        eleicao.rodada_id,
        eleicao.tipo,
        eleicao.associado_id,
      ]
    );
  }

  async buscarEleicoes(rodadaId: number): Promise<Eleicao[]> {
    return dbAll(
      "SELECT * FROM eleicoes WHERE rodada_id = ? ORDER BY tipo, votos DESC",
      [rodadaId]
    ) as Promise<Eleicao[]>;
  }

  async votarGolMaisBonito(gol: GolMaisBonito): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO gols_mais_bonitos (rodada_id, associado_id, descricao, votos) 
       VALUES (?, ?, ?, COALESCE((SELECT votos FROM gols_mais_bonitos WHERE rodada_id = ? AND associado_id = ?), 0) + 1)`,
      [
        gol.rodada_id,
        gol.associado_id,
        gol.descricao || null,
        gol.rodada_id,
        gol.associado_id,
      ]
    );
  }

  async buscarGolsMaisBonitos(rodadaId: number): Promise<GolMaisBonito[]> {
    return dbAll(
      "SELECT * FROM gols_mais_bonitos WHERE rodada_id = ? ORDER BY votos DESC",
      [rodadaId]
    ) as Promise<GolMaisBonito[]>;
  }

  // ========== PARTIDAS (para formato tempo/gols) ==========
  async criarPartida(partida: Partida): Promise<Partida> {
    // Buscar próximo número de partida para esta rodada
    const ultimaPartida = await dbGet(
      "SELECT MAX(numero) as max_numero FROM partidas WHERE rodada_id = ?",
      [partida.rodada_id]
    ) as { max_numero: number } | null;

    const proximoNumero = (ultimaPartida?.max_numero || 0) + 1;

    const result = await dbRun(
      "INSERT INTO partidas (rodada_id, numero, inicio_em) VALUES (?, ?, CURRENT_TIMESTAMP)",
      [partida.rodada_id, proximoNumero]
    );
    return { ...partida, id: result.lastID, numero: proximoNumero };
  }

  async listarPartidas(rodadaId: number): Promise<Partida[]> {
    return dbAll(
      "SELECT * FROM partidas WHERE rodada_id = ? ORDER BY numero",
      [rodadaId]
    ) as Promise<Partida[]>;
  }

  async buscarPartidaPorId(partidaId: number): Promise<Partida | null> {
    return dbGet("SELECT * FROM partidas WHERE id = ?", [
      partidaId,
    ]) as Promise<Partida | null>;
  }

  async finalizarPartida(partidaId: number): Promise<void> {
    await dbRun(
      "UPDATE partidas SET fim_em = CURRENT_TIMESTAMP WHERE id = ?",
      [partidaId]
    );
  }

  async sortearTimesPartida(partidaId: number, usarTimesRodada: boolean = false): Promise<void> {
    const partida = await this.buscarPartidaPorId(partidaId);
    if (!partida) {
      throw new Error("Partida não encontrada");
    }

    const rodada = await this.buscarRodadaPorId(partida.rodada_id);
    if (!rodada) {
      throw new Error("Rodada não encontrada");
    }

    if (usarTimesRodada) {
      // Usar os times já sorteados da rodada
      const timesRodada = await this.buscarTimesRodada(partida.rodada_id);
      
      // Limpar times anteriores desta partida
      await dbRun("DELETE FROM times_partida WHERE partida_id = ?", [partidaId]);

      // Copiar times da rodada para a partida
      for (const timeRodada of timesRodada) {
        await dbRun(
          "INSERT INTO times_partida (partida_id, associado_id, time, is_goleiro) VALUES (?, ?, ?, ?)",
          [partidaId, timeRodada.associado_id, timeRodada.time, timeRodada.is_goleiro ? 1 : 0]
        );
      }
    } else {
      // Sortear novamente apenas com quem fez check-in (usando mesma lógica do sortearTimes)
      const grupo = await dbGet(
        "SELECT quantidade_jogadores_linha FROM grupos WHERE id = ?",
        [rodada.grupo_id]
      ) as { quantidade_jogadores_linha: number } | null;

      const quantidadeJogadoresLinha = grupo?.quantidade_jogadores_linha || 10;

      const presentes = (await dbAll(
        `SELECT p.associado_id, a.posicao 
         FROM presencas p
         JOIN associados a ON p.associado_id = a.id
         WHERE p.rodada_id = ? AND p.presente = 1`,
        [partida.rodada_id]
      )) as { associado_id: number; posicao: string }[];

      if (presentes.length === 0) {
        throw new Error("Nenhum associado presente para sortear times");
      }

      // Separar goleiros dos demais
      const goleiros = presentes.filter((p) => p.posicao.toLowerCase() === "goleiro");
      const jogadoresLinha = presentes.filter((p) => p.posicao.toLowerCase() !== "goleiro");

      // Calcular quantidade de times
      const quantidadeTimes = rodada.quantidade_times || Math.floor(presentes.length / quantidadeJogadoresLinha) || 2;
      const quantidadeTimesFinal = Math.min(quantidadeTimes, Math.floor(presentes.length / quantidadeJogadoresLinha) || 2);

      if (quantidadeTimesFinal < 2) {
        throw new Error(`Não há jogadores suficientes. Mínimo necessário: ${quantidadeJogadoresLinha * 2} jogadores`);
      }

      // Embaralhar
      const goleirosEmbaralhados = [...goleiros].sort(() => Math.random() - 0.5);
      const jogadoresEmbaralhados = [...jogadoresLinha].sort(() => Math.random() - 0.5);

      // Limpar times anteriores desta partida
      await dbRun("DELETE FROM times_partida WHERE partida_id = ?", [partidaId]);

      // Distribuir goleiros primeiro
      for (let index = 0; index < goleirosEmbaralhados.length; index++) {
        if (index < quantidadeTimesFinal) {
          const goleiro = goleirosEmbaralhados[index];
          const timeLetra = String.fromCharCode(65 + index);
          await dbRun(
            "INSERT INTO times_partida (partida_id, associado_id, time, is_goleiro) VALUES (?, ?, ?, ?)",
            [partidaId, goleiro.associado_id, timeLetra, 1]
          );
        }
      }

      // Distribuir jogadores de linha
      for (let index = 0; index < jogadoresEmbaralhados.length; index++) {
        const jogador = jogadoresEmbaralhados[index];
        const timeLetra = String.fromCharCode(65 + (index % quantidadeTimesFinal));
        await dbRun(
          "INSERT INTO times_partida (partida_id, associado_id, time, is_goleiro) VALUES (?, ?, ?, ?)",
          [partidaId, jogador.associado_id, timeLetra, 0]
        );
      }
    }
  }

  async dividirTimesPartida(
    partidaId: number,
    divisao: { associado_id: number; time: string; is_goleiro?: boolean }[]
  ): Promise<void> {
    await dbRun("DELETE FROM times_partida WHERE partida_id = ?", [partidaId]);

    for (const item of divisao) {
      await dbRun(
        "INSERT INTO times_partida (partida_id, associado_id, time, is_goleiro) VALUES (?, ?, ?, ?)",
        [partidaId, item.associado_id, item.time, item.is_goleiro ? 1 : 0]
      );
    }
  }

  async buscarTimesPartida(partidaId: number): Promise<TimePartida[]> {
    return dbAll(
      "SELECT * FROM times_partida WHERE partida_id = ? ORDER BY time, associado_id",
      [partidaId]
    ) as Promise<TimePartida[]>;
  }

  async salvarResultadoPartida(resultado: ResultadoPartida): Promise<void> {
    await dbRun(
      "INSERT OR REPLACE INTO resultados_partida (partida_id, time_nome, gols) VALUES (?, ?, ?)",
      [resultado.partida_id, resultado.time_nome, resultado.gols]
    );
  }

  async buscarResultadosPartida(partidaId: number): Promise<ResultadoPartida[]> {
    return dbAll(
      "SELECT * FROM resultados_partida WHERE partida_id = ? ORDER BY time_nome",
      [partidaId]
    ) as Promise<ResultadoPartida[]>;
  }

  async salvarEstatisticasPartida(estatistica: EstatisticaPartida): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO estatisticas_partida 
       (associado_id, partida_id, gols, assistencias, cartao_amarelo, cartao_azul, cartao_vermelho, cartao_azul_vermelho) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        estatistica.associado_id,
        estatistica.partida_id,
        estatistica.gols,
        estatistica.assistencias,
        estatistica.cartao_amarelo,
        estatistica.cartao_azul,
        estatistica.cartao_vermelho,
        estatistica.cartao_azul_vermelho,
      ]
    );
  }

  async buscarEstatisticasPartida(partidaId: number): Promise<EstatisticaPartida[]> {
    return dbAll("SELECT * FROM estatisticas_partida WHERE partida_id = ?", [
      partidaId,
    ]) as Promise<EstatisticaPartida[]>;
  }
}

