import { dbRun, dbGet, dbAll } from '../database/db';
import { Associado, AssociadoEstatisticas } from '../models/Associado';

export class AssociadoService {
  async criar(associado: Associado): Promise<Associado> {
    const result = await dbRun(
      'INSERT INTO associados (nome, apelido, posicao) VALUES (?, ?, ?)',
      [associado.nome, associado.apelido, associado.posicao]
    );
    return { ...associado, id: result.lastID };
  }

  async listar(): Promise<Associado[]> {
    return dbAll('SELECT * FROM associados ORDER BY nome') as Promise<Associado[]>;
  }

  async buscarPorId(id: number): Promise<Associado | null> {
    return dbGet('SELECT * FROM associados WHERE id = ?', [id]) as Promise<Associado | null>;
  }

  async atualizar(id: number, associado: Partial<Associado>): Promise<void> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (associado.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(associado.nome);
    }
    if (associado.apelido !== undefined) {
      campos.push('apelido = ?');
      valores.push(associado.apelido);
    }
    if (associado.posicao !== undefined) {
      campos.push('posicao = ?');
      valores.push(associado.posicao);
    }

    campos.push('updated_at = CURRENT_TIMESTAMP');
    valores.push(id);

    await dbRun(
      `UPDATE associados SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
  }

  async deletar(id: number): Promise<void> {
    await dbRun('DELETE FROM associados WHERE id = ?', [id]);
  }

  async calcularEstatisticas(associadoId: number, periodo?: { inicio?: string; fim?: string }): Promise<AssociadoEstatisticas> {
    const associado = await this.buscarPorId(associadoId);
    if (!associado) {
      throw new Error('Associado não encontrado');
    }

    const params: any[] = [associadoId];
    let periodoWhere = '';
    
    if (periodo?.inicio) {
      periodoWhere += ' AND r.data >= ?';
      params.push(periodo.inicio);
    }
    if (periodo?.fim) {
      periodoWhere += ' AND r.data <= ?';
      params.push(periodo.fim);
    }

    // Total de rodadas com presença
    const totalRodadas = await dbGet(
      `SELECT COUNT(*) as count FROM presencas p 
       JOIN rodadas r ON p.rodada_id = r.id 
       WHERE p.associado_id = ? AND p.presente = 1${periodoWhere}`,
      params
    ) as { count: number };

    // Estatísticas de rodadas
    const statsRodada = await dbGet(
      `SELECT 
        COALESCE(SUM(e.gols), 0) as total_gols,
        COALESCE(SUM(e.assistencias), 0) as total_assistencias,
        COALESCE(SUM(e.cartao_amarelo), 0) as total_cartoes_amarelos,
        COALESCE(SUM(e.cartao_azul), 0) as total_cartoes_azuis,
        COALESCE(SUM(e.cartao_vermelho), 0) as total_cartoes_vermelhos,
        COALESCE(SUM(e.cartao_azul_vermelho), 0) as total_cartoes_azul_vermelho
       FROM estatisticas_rodada e
       JOIN rodadas r ON e.rodada_id = r.id
       WHERE e.associado_id = ?${periodoWhere}`,
      params
    ) as any;

    // Estatísticas de partidas (súmulas)
    const statsPartida = await dbGet(
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
       WHERE ep.associado_id = ?${periodoWhere}`,
      params
    ) as any;

    // Combinar estatísticas
    const stats = {
      total_gols: (statsRodada?.total_gols || 0) + (statsPartida?.total_gols || 0),
      total_assistencias: (statsRodada?.total_assistencias || 0) + (statsPartida?.total_assistencias || 0),
      total_cartoes_amarelos: (statsRodada?.total_cartoes_amarelos || 0) + (statsPartida?.total_cartoes_amarelos || 0),
      total_cartoes_azuis: (statsRodada?.total_cartoes_azuis || 0) + (statsPartida?.total_cartoes_azuis || 0),
      total_cartoes_vermelhos: (statsRodada?.total_cartoes_vermelhos || 0) + (statsPartida?.total_cartoes_vermelhos || 0),
      total_cartoes_azul_vermelho: (statsRodada?.total_cartoes_azul_vermelho || 0) + (statsPartida?.total_cartoes_azul_vermelho || 0),
    };

    // Vitórias, empates e derrotas - Resultados de rodadas
    const resultadosRodadaParams: any[] = [associadoId];
    let resultadosRodadaWhere = 'WHERE tr.associado_id = ?';
    if (periodo?.inicio) {
      resultadosRodadaWhere += ' AND r.data >= ?';
      resultadosRodadaParams.push(periodo.inicio);
    }
    if (periodo?.fim) {
      resultadosRodadaWhere += ' AND r.data <= ?';
      resultadosRodadaParams.push(periodo.fim);
    }

    const resultadosRodada = await dbAll(
      `SELECT res.rodada_id, res.time_nome, res.gols, tr.time, tr.associado_id
       FROM resultados_rodada res
       JOIN rodadas r ON res.rodada_id = r.id
       JOIN times_rodada tr ON res.rodada_id = tr.rodada_id AND res.time_nome = tr.time
       ${resultadosRodadaWhere}`,
      resultadosRodadaParams
    ) as any[];

    // Vitórias, empates e derrotas - Resultados de partidas
    const resultadosPartidaParams: any[] = [associadoId];
    let resultadosPartidaWhere = 'WHERE tp.associado_id = ?';
    if (periodo?.inicio) {
      resultadosPartidaWhere += ' AND r.data >= ?';
      resultadosPartidaParams.push(periodo.inicio);
    }
    if (periodo?.fim) {
      resultadosPartidaWhere += ' AND r.data <= ?';
      resultadosPartidaParams.push(periodo.fim);
    }

    const resultadosPartida = await dbAll(
      `SELECT p.id as partida_id, p.rodada_id, rp.time_nome, rp.gols, tp.time, tp.associado_id
       FROM resultados_partida rp
       JOIN partidas p ON rp.partida_id = p.id
       JOIN rodadas r ON p.rodada_id = r.id
       JOIN times_partida tp ON rp.partida_id = tp.partida_id AND rp.time_nome = tp.time
       ${resultadosPartidaWhere}`,
      resultadosPartidaParams
    ) as any[];

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
        (t: any) => t.associado_id === associadoId
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
        (t: any) => t.associado_id === associadoId
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
    const ausenciasParams: any[] = [associadoId];
    let ausenciasWhere = 'WHERE c.associado_id = ? AND c.confirmado = 1 AND (p.presente = 0 OR p.presente IS NULL)';
    if (periodo?.inicio) {
      ausenciasWhere += ' AND c.rodada_id IN (SELECT id FROM rodadas WHERE data >= ?)';
      ausenciasParams.push(periodo.inicio);
    }
    if (periodo?.fim) {
      ausenciasWhere += ' AND c.rodada_id IN (SELECT id FROM rodadas WHERE data <= ?)';
      ausenciasParams.push(periodo.fim);
    }

    const ausencias = await dbGet(
      `SELECT COUNT(*) as count FROM confirmacoes c
       LEFT JOIN presencas p ON c.associado_id = p.associado_id AND c.rodada_id = p.rodada_id
       ${ausenciasWhere}`,
      ausenciasParams
    ) as { count: number };
    pontos -= ausencias.count || 0;

    // Pontos por resultados
    pontos += vitorias * 3;
    pontos += empates * 1;

    // Pontos negativos por cartões
    pontos -= (stats.total_cartoes_azuis || 0) * 2;
    pontos -= (stats.total_cartoes_vermelhos || 0) * 3;
    pontos -= (stats.total_cartoes_azul_vermelho || 0) * 5;

    const totalJogosNum = totalRodadas.count || 0;
    const totalGols = stats.total_gols || 0;
    const mediaGols = totalJogosNum > 0 ? totalGols / totalJogosNum : 0;
    const aproveitamentoVitoria = totalJogosNum > 0 ? (vitorias / totalJogosNum) * 100 : 0;
    
    // Frequência (total de rodadas com presença / total de rodadas disponíveis)
    const rodadasDisponiveisParams: any[] = [];
    let rodadasDisponiveisWhere = '';
    if (periodo?.inicio) {
      rodadasDisponiveisWhere += 'WHERE data >= ?';
      rodadasDisponiveisParams.push(periodo.inicio);
    }
    if (periodo?.fim) {
      rodadasDisponiveisWhere += rodadasDisponiveisWhere ? ' AND data <= ?' : 'WHERE data <= ?';
      rodadasDisponiveisParams.push(periodo.fim);
    }

    const totalRodadasDisponiveis = await dbGet(
      `SELECT COUNT(*) as count FROM rodadas ${rodadasDisponiveisWhere}`,
      rodadasDisponiveisParams
    ) as { count: number };
    const frequencia = totalRodadasDisponiveis.count > 0 ? (totalJogosNum / totalRodadasDisponiveis.count) * 100 : 0;

    const percentualVitoria = totalJogosNum > 0 ? (vitorias / totalJogosNum) * 100 : 0;
    const percentualDerrota = totalJogosNum > 0 ? (derrotas / totalJogosNum) * 100 : 0;
    const percentualEmpate = totalJogosNum > 0 ? (empates / totalJogosNum) * 100 : 0;

    // Buscar grupos do associado
    const grupos = await dbAll(
      `SELECT g.id, g.nome FROM grupos g
       JOIN grupo_associados ga ON g.id = ga.grupo_id
       WHERE ga.associado_id = ? AND ga.status = 'ativo'`,
      [associadoId]
    ) as Array<{ id: number; nome: string }>;

    return {
      ...associado,
      total_jogos: totalJogosNum,
      total_pontos: pontos,
      total_gols: totalGols,
      total_assistencias: stats.total_assistencias || 0,
      total_vitorias: vitorias,
      total_derrotas: derrotas,
      total_empates: empates,
      total_cartoes_amarelos: stats.total_cartoes_amarelos || 0,
      total_cartoes_azuis: stats.total_cartoes_azuis || 0,
      total_cartoes_vermelhos: stats.total_cartoes_vermelhos || 0,
      total_cartoes_azul_vermelho: stats.total_cartoes_azul_vermelho || 0,
      media_gols: Number(mediaGols.toFixed(2)),
      aproveitamento_vitoria: Number(aproveitamentoVitoria.toFixed(2)),
      frequencia: Number(frequencia.toFixed(2)),
      percentual_vitoria: Number(percentualVitoria.toFixed(2)),
      percentual_derrota: Number(percentualDerrota.toFixed(2)),
      percentual_empate: Number(percentualEmpate.toFixed(2)),
      grupos: grupos
    };
  }
}

