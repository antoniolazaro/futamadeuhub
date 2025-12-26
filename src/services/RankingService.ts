import { dbAll, dbGet } from "../database/db";

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

export class RankingService {
  async calcularRankingGrupo(
    grupoId: number,
    periodo?: { inicio?: string; fim?: string }
  ): Promise<RankingGrupo[]> {
    const params: any[] = [grupoId];
    let periodoWhere = "";

    if (periodo?.inicio) {
      periodoWhere += " AND r.data >= ?";
      params.push(periodo.inicio);
    }
    if (periodo?.fim) {
      periodoWhere += " AND r.data <= ?";
      params.push(periodo.fim);
    }

    // Buscar todos os associados do grupo
    const associados = (await dbAll(
      `SELECT DISTINCT a.id, a.nome, a.apelido, a.posicao
       FROM associados a
       JOIN grupo_associados ga ON a.id = ga.associado_id
       WHERE ga.grupo_id = ? AND ga.status = 'ativo'`,
      [grupoId]
    )) as { id: number; nome: string; apelido: string; posicao: string }[];

    const rankings: RankingGrupo[] = [];

    for (const assoc of associados) {
      // Total de rodadas com presença
      const totalRodadas = (await dbGet(
        `SELECT COUNT(*) as count FROM presencas p 
         JOIN rodadas r ON p.rodada_id = r.id
         WHERE p.associado_id = ? AND p.presente = 1 AND r.grupo_id = ?${periodoWhere}`,
        [assoc.id, grupoId, ...params.slice(1)]
      )) as { count: number };

      // Estatísticas de gols e assistências (rodadas + partidas)
      const statsRodada = (await dbGet(
        `SELECT 
          COALESCE(SUM(e.gols), 0) as total_gols,
          COALESCE(SUM(e.assistencias), 0) as total_assistencias,
          COALESCE(SUM(e.cartao_amarelo), 0) as total_cartoes_amarelos,
          COALESCE(SUM(e.cartao_azul), 0) as total_cartoes_azuis,
          COALESCE(SUM(e.cartao_vermelho), 0) as total_cartoes_vermelhos,
          COALESCE(SUM(e.cartao_azul_vermelho), 0) as total_cartoes_azul_vermelho
         FROM estatisticas_rodada e
         JOIN rodadas r ON e.rodada_id = r.id
         WHERE e.associado_id = ? AND r.grupo_id = ?${periodoWhere}`,
        [assoc.id, grupoId, ...params.slice(1)]
      )) as any;

      const statsPartida = (await dbGet(
        `SELECT 
          COALESCE(SUM(ep.gols), 0) as total_gols,
          COALESCE(SUM(ep.assistencias), 0) as total_assistencias,
          COALESCE(SUM(ep.cartao_amarelo), 0) as total_cartoes_amarelos,
          COALESCE(SUM(ep.cartao_azul), 0) as total_cartoes_azuis,
          COALESCE(SUM(ep.cartao_vermelho), 0) as total_cartoes_vermelhos,
          COALESCE(SUM(ep.cartao_azul_vermelho), 0) as total_cartoes_azul_vermelho
         FROM estatisticas_partida ep
         JOIN partidas p ON ep.partida_id = p.id
         JOIN rodadas r ON p.rodada_id = r.id
         WHERE ep.associado_id = ? AND r.grupo_id = ?${periodoWhere}`,
        [assoc.id, grupoId, ...params.slice(1)]
      )) as any;

      // Combinar estatísticas de rodadas e partidas
      const stats = {
        total_gols: (statsRodada?.total_gols || 0) + (statsPartida?.total_gols || 0),
        total_assistencias: (statsRodada?.total_assistencias || 0) + (statsPartida?.total_assistencias || 0),
        total_cartoes_amarelos: (statsRodada?.total_cartoes_amarelos || 0) + (statsPartida?.total_cartoes_amarelos || 0),
        total_cartoes_azuis: (statsRodada?.total_cartoes_azuis || 0) + (statsPartida?.total_cartoes_azuis || 0),
        total_cartoes_vermelhos: (statsRodada?.total_cartoes_vermelhos || 0) + (statsPartida?.total_cartoes_vermelhos || 0),
        total_cartoes_azul_vermelho: (statsRodada?.total_cartoes_azul_vermelho || 0) + (statsPartida?.total_cartoes_azul_vermelho || 0),
      };

      // Vitórias, empates e derrotas
      const resultadosParams: any[] = [assoc.id, grupoId];
      let resultadosWhere = `WHERE tr.associado_id = ? AND r.grupo_id = ?`;
      if (periodo?.inicio) {
        resultadosWhere += " AND r.data >= ?";
        resultadosParams.push(periodo.inicio);
      }
      if (periodo?.fim) {
        resultadosWhere += " AND r.data <= ?";
        resultadosParams.push(periodo.fim);
      }

      // Resultados de rodadas
      const resultadosRodada = (await dbAll(
        `SELECT res.rodada_id, res.time_nome, res.gols, tr.time, tr.associado_id
         FROM resultados_rodada res
         JOIN rodadas r ON res.rodada_id = r.id
         JOIN times_rodada tr ON res.rodada_id = tr.rodada_id AND res.time_nome = tr.time
         ${resultadosWhere}`
      )) as any[];

      // Resultados de partidas (súmulas)
      const resultadosPartidaParams: any[] = [assoc.id, grupoId];
      let resultadosPartidaWhere = `WHERE tp.associado_id = ? AND r.grupo_id = ?`;
      if (periodo?.inicio) {
        resultadosPartidaWhere += " AND r.data >= ?";
        resultadosPartidaParams.push(periodo.inicio);
      }
      if (periodo?.fim) {
        resultadosPartidaWhere += " AND r.data <= ?";
        resultadosPartidaParams.push(periodo.fim);
      }

      const resultadosPartida = (await dbAll(
        `SELECT p.id as partida_id, p.rodada_id, rp.time_nome, rp.gols, tp.time, tp.associado_id
         FROM resultados_partida rp
         JOIN partidas p ON rp.partida_id = p.id
         JOIN rodadas r ON p.rodada_id = r.id
         JOIN times_partida tp ON rp.partida_id = tp.partida_id AND rp.time_nome = tp.time
         ${resultadosPartidaWhere}`
      )) as any[];

      // Agrupar resultados de rodadas por rodada_id
      const rodadasMap = new Map<number, any[]>();
      resultadosRodada.forEach((r) => {
        if (!rodadasMap.has(r.rodada_id)) {
          rodadasMap.set(r.rodada_id, []);
        }
        rodadasMap.get(r.rodada_id)!.push(r);
      });

      // Agrupar resultados de partidas por partida_id (cada partida é um confronto separado)
      const partidasMap = new Map<number, any[]>();
      resultadosPartida.forEach((r) => {
        const partidaId = r.partida_id;
        if (!partidasMap.has(partidaId)) {
          partidasMap.set(partidaId, []);
        }
        partidasMap.get(partidaId)!.push(r);
      });

      let vitorias = 0;
      let empates = 0;
      let derrotas = 0;

      // Processar resultados de rodadas
      rodadasMap.forEach((timesRodada) => {
        const golsPorTime = timesRodada.map((t: any) => t.gols);
        const maxGols = Math.max(...golsPorTime);
        const minGols = Math.min(...golsPorTime);
        const timeDoAssociado = timesRodada.find(
          (t: any) => t.associado_id === assoc.id
        );

        if (!timeDoAssociado) return;

        if (timeDoAssociado.gols === maxGols && maxGols !== minGols) {
          vitorias++;
        } else if (maxGols === minGols) {
          empates++;
        } else {
          derrotas++;
        }
      });

      // Processar resultados de partidas (súmulas)
      partidasMap.forEach((timesPartida) => {
        const golsPorTime = timesPartida.map((t: any) => t.gols);
        const maxGols = Math.max(...golsPorTime);
        const minGols = Math.min(...golsPorTime);
        const timeDoAssociado = timesPartida.find(
          (t: any) => t.associado_id === assoc.id
        );

        if (!timeDoAssociado) return;

        if (timeDoAssociado.gols === maxGols && maxGols !== minGols) {
          vitorias++;
        } else if (maxGols === minGols) {
          empates++;
        } else {
          derrotas++;
        }
      });

      // Cálculo de pontos
      let pontos = 0;

      // Pontos por presença
      pontos += totalRodadas.count || 0;

      // Pontos por ausência após confirmação
      const ausenciasParams: any[] = [assoc.id, grupoId];
      let ausenciasWhere = `WHERE c.associado_id = ? AND c.confirmado = 1 AND (p.presente = 0 OR p.presente IS NULL) AND r.grupo_id = ?`;
      if (periodo?.inicio) {
        ausenciasWhere +=
          " AND c.rodada_id IN (SELECT id FROM rodadas WHERE data >= ?)";
        ausenciasParams.push(periodo.inicio);
      }
      if (periodo?.fim) {
        ausenciasWhere +=
          " AND c.rodada_id IN (SELECT id FROM rodadas WHERE data <= ?)";
        ausenciasParams.push(periodo.fim);
      }

      const ausencias = (await dbGet(
        `SELECT COUNT(*) as count FROM confirmacoes c
         JOIN rodadas r ON c.rodada_id = r.id
         LEFT JOIN presencas p ON c.associado_id = p.associado_id AND c.rodada_id = p.rodada_id
         ${ausenciasWhere}`,
        ausenciasParams
      )) as { count: number };
      pontos -= ausencias.count || 0;

      // Pontos por vitórias, empates e derrotas
      pontos += vitorias * 3;
      pontos += empates * 1;
      pontos += derrotas * 0;

      // Pontos por cartões
      pontos -= (stats.total_cartoes_azuis || 0) * 2;
      pontos -= (stats.total_cartoes_vermelhos || 0) * 3;
      pontos -= (stats.total_cartoes_azul_vermelho || 0) * 5;

      // Total de rodadas do grupo no período
      const totalRodadasGrupo = (await dbGet(
        `SELECT COUNT(*) as count FROM rodadas r
         WHERE r.grupo_id = ?${periodoWhere}`,
        [grupoId, ...params.slice(1)]
      )) as { count: number };

      const totalGols = stats.total_gols || 0;
      const totalJogos = totalRodadas.count || 0;
      const mediaGols = totalJogos > 0 ? totalGols / totalJogos : 0;
      const aproveitamento =
        totalJogos > 0 ? ((vitorias * 3 + empates) / (totalJogos * 3)) * 100 : 0;
      const frequencia =
        totalRodadasGrupo.count > 0
          ? (totalJogos / totalRodadasGrupo.count) * 100
          : 0;

      rankings.push({
        associado_id: assoc.id,
        nome: assoc.nome,
        apelido: assoc.apelido,
        posicao: assoc.posicao,
        pontos,
        jogos: totalJogos,
        vitorias,
        empates,
        derrotas,
        gols: totalGols,
        assistencias: stats.total_assistencias || 0,
        media_gols: mediaGols,
        aproveitamento,
        frequencia,
        cartoes_amarelos: stats.total_cartoes_amarelos || 0,
        cartoes_azuis: stats.total_cartoes_azuis || 0,
        cartoes_vermelhos: stats.total_cartoes_vermelhos || 0,
        cartoes_azul_vermelho: stats.total_cartoes_azul_vermelho || 0,
      });
    }

    // Ordenar por pontos (descendente)
    return rankings.sort((a, b) => b.pontos - a.pontos);
  }
}

