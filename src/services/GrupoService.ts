import { dbRun, dbGet, dbAll } from "../database/db";
import {
  Grupo,
  GrupoCompleto,
  AssociadoGrupo,
  SolicitacaoGrupo,
} from "../models/Grupo";
import crypto from "crypto";

export class GrupoService {
  async criar(grupo: Grupo): Promise<Grupo> {
    // Gerar link de convite único
    const linkConvite = crypto.randomBytes(16).toString("hex");

    const result = await dbRun(
      `INSERT INTO grupos (nome, descricao, local, dia_semana, horario_inicio, horario_fim, periodicidade, quantidade_jogadores_linha, quantidade_minima_jogadores, quantidade_maxima_jogadores, tipo_time, link_convite) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        grupo.nome,
        grupo.descricao || null,
        grupo.local || null,
        grupo.dia_semana,
        grupo.horario_inicio,
        grupo.horario_fim,
        grupo.periodicidade || "semanal",
        grupo.quantidade_jogadores_linha || 10,
        grupo.quantidade_minima_jogadores || 12,
        grupo.quantidade_maxima_jogadores || 24,
        grupo.tipo_time || "dinamico",
        linkConvite,
      ]
    );
    return { ...grupo, id: result.lastID, link_convite: linkConvite };
  }

  async listar(): Promise<Grupo[]> {
    return dbAll("SELECT * FROM grupos ORDER BY nome") as Promise<Grupo[]>;
  }

  async buscarPorId(id: number): Promise<Grupo | null> {
    return dbGet("SELECT * FROM grupos WHERE id = ?", [
      id,
    ]) as Promise<Grupo | null>;
  }

  async atualizar(id: number, grupo: Partial<Grupo>): Promise<void> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (grupo.nome !== undefined) {
      campos.push("nome = ?");
      valores.push(grupo.nome);
    }
    if (grupo.descricao !== undefined) {
      campos.push("descricao = ?");
      valores.push(grupo.descricao);
    }
    if (grupo.local !== undefined) {
      campos.push("local = ?");
      valores.push(grupo.local);
    }
    if (grupo.dia_semana !== undefined) {
      campos.push("dia_semana = ?");
      valores.push(grupo.dia_semana);
    }
    if (grupo.horario_inicio !== undefined) {
      campos.push("horario_inicio = ?");
      valores.push(grupo.horario_inicio);
    }
    if (grupo.horario_fim !== undefined) {
      campos.push("horario_fim = ?");
      valores.push(grupo.horario_fim);
    }
    if (grupo.periodicidade !== undefined) {
      campos.push("periodicidade = ?");
      valores.push(grupo.periodicidade);
    }
    if (grupo.quantidade_jogadores_linha !== undefined) {
      campos.push("quantidade_jogadores_linha = ?");
      valores.push(grupo.quantidade_jogadores_linha);
    }
    if (grupo.quantidade_minima_jogadores !== undefined) {
      campos.push("quantidade_minima_jogadores = ?");
      valores.push(grupo.quantidade_minima_jogadores);
    }
    if (grupo.quantidade_maxima_jogadores !== undefined) {
      campos.push("quantidade_maxima_jogadores = ?");
      valores.push(grupo.quantidade_maxima_jogadores);
    }
    if (grupo.tipo_time !== undefined) {
      campos.push("tipo_time = ?");
      valores.push(grupo.tipo_time);
    }

    campos.push("updated_at = CURRENT_TIMESTAMP");
    valores.push(id);

    await dbRun(`UPDATE grupos SET ${campos.join(", ")} WHERE id = ?`, valores);
  }

  async deletar(id: number): Promise<void> {
    await dbRun("DELETE FROM grupos WHERE id = ?", [id]);
  }

  async adicionarResponsavel(
    grupoId: number,
    associadoId: number
  ): Promise<void> {
    await dbRun(
      "INSERT OR IGNORE INTO grupo_responsaveis (grupo_id, associado_id) VALUES (?, ?)",
      [grupoId, associadoId]
    );
  }

  async removerResponsavel(
    grupoId: number,
    associadoId: number
  ): Promise<void> {
    await dbRun(
      "DELETE FROM grupo_responsaveis WHERE grupo_id = ? AND associado_id = ?",
      [grupoId, associadoId]
    );
  }

  async listarResponsaveis(grupoId: number): Promise<AssociadoGrupo[]> {
    const resultados = await dbAll(
      `SELECT gr.*, a.id as associado_id_full, a.nome, a.apelido, a.posicao 
       FROM grupo_responsaveis gr
       JOIN associados a ON gr.associado_id = a.id
       WHERE gr.grupo_id = ?`,
      [grupoId]
    ) as any[];
    
    return resultados.map((row) => ({
      id: row.id,
      associado_id: row.associado_id,
      grupo_id: row.grupo_id,
      created_at: row.created_at,
      associado: {
        id: row.associado_id_full,
        nome: row.nome,
        apelido: row.apelido,
        posicao: row.posicao,
      },
    }));
  }

  async adicionarAssociado(
    grupoId: number,
    associadoId: number,
    criadoVia: "convite" | "solicitacao" = "convite"
  ): Promise<void> {
    await dbRun(
      "INSERT OR REPLACE INTO grupo_associados (grupo_id, associado_id, status, criado_via) VALUES (?, ?, 'ativo', ?)",
      [grupoId, associadoId, criadoVia]
    );
  }

  async removerAssociado(grupoId: number, associadoId: number): Promise<void> {
    await dbRun(
      "DELETE FROM grupo_associados WHERE grupo_id = ? AND associado_id = ?",
      [grupoId, associadoId]
    );
  }

  async listarAssociados(grupoId: number): Promise<AssociadoGrupo[]> {
    const resultados = await dbAll(
      `SELECT ga.*, a.id as associado_id_full, a.nome, a.apelido, a.posicao 
       FROM grupo_associados ga
       JOIN associados a ON ga.associado_id = a.id
       WHERE ga.grupo_id = ?`,
      [grupoId]
    ) as any[];
    
    return resultados.map((row) => ({
      id: row.id,
      associado_id: row.associado_id,
      grupo_id: row.grupo_id,
      status: row.status,
      criado_via: row.criado_via,
      created_at: row.created_at,
      associado: {
        id: row.associado_id_full,
        nome: row.nome,
        apelido: row.apelido,
        posicao: row.posicao,
      },
    }));
  }

  async buscarCompleto(id: number): Promise<GrupoCompleto | null> {
    const grupo = await this.buscarPorId(id);
    if (!grupo) {
      return null;
    }

    const responsaveis = await this.listarResponsaveis(id);
    const associados = await this.listarAssociados(id);

    return {
      ...grupo,
      responsaveis,
      associados,
    };
  }

  async buscarGruposPorAssociado(associadoId: number): Promise<Grupo[]> {
    return dbAll(
      `SELECT g.* FROM grupos g
       JOIN grupo_associados ga ON g.id = ga.grupo_id
       WHERE ga.associado_id = ?`,
      [associadoId]
    ) as Promise<Grupo[]>;
  }

  async buscarGruposComoResponsavel(associadoId: number): Promise<Grupo[]> {
    return dbAll(
      `SELECT g.* FROM grupos g
       JOIN grupo_responsaveis gr ON g.id = gr.grupo_id
       WHERE gr.associado_id = ?`,
      [associadoId]
    ) as Promise<Grupo[]>;
  }

  async buscarPorLinkConvite(linkConvite: string): Promise<Grupo | null> {
    return dbGet("SELECT * FROM grupos WHERE link_convite = ?", [
      linkConvite,
    ]) as Promise<Grupo | null>;
  }

  async gerarNovoLinkConvite(grupoId: number): Promise<string> {
    const novoLink = crypto.randomBytes(16).toString("hex");
    await dbRun("UPDATE grupos SET link_convite = ? WHERE id = ?", [
      novoLink,
      grupoId,
    ]);
    return novoLink;
  }

  async criarSolicitacao(
    solicitacao: SolicitacaoGrupo
  ): Promise<SolicitacaoGrupo> {
    // Verificar se já existe solicitação pendente
    const existente = (await dbGet(
      "SELECT * FROM solicitacoes_grupo WHERE grupo_id = ? AND associado_id = ? AND status = 'pendente'",
      [solicitacao.grupo_id, solicitacao.associado_id]
    )) as SolicitacaoGrupo | null;

    if (existente) {
      throw new Error("Já existe uma solicitação pendente para este grupo");
    }

    const result = await dbRun(
      "INSERT INTO solicitacoes_grupo (grupo_id, associado_id, mensagem) VALUES (?, ?, ?)",
      [
        solicitacao.grupo_id,
        solicitacao.associado_id,
        solicitacao.mensagem || null,
      ]
    );
    return { ...solicitacao, id: result.lastID };
  }

  async listarSolicitacoes(grupoId: number): Promise<SolicitacaoGrupo[]> {
    return dbAll(
      `SELECT s.*, a.nome, a.apelido, a.posicao, g.nome as grupo_nome
       FROM solicitacoes_grupo s
       JOIN associados a ON s.associado_id = a.id
       JOIN grupos g ON s.grupo_id = g.id
       WHERE s.grupo_id = ? AND s.status = 'pendente'
       ORDER BY s.created_at DESC`,
      [grupoId]
    ) as Promise<SolicitacaoGrupo[]>;
  }

  async listarSolicitacoesPorAssociado(
    associadoId: number
  ): Promise<SolicitacaoGrupo[]> {
    return dbAll(
      `SELECT s.*, a.nome, a.apelido, a.posicao, g.nome as grupo_nome
       FROM solicitacoes_grupo s
       JOIN associados a ON s.associado_id = a.id
       JOIN grupos g ON s.grupo_id = g.id
       WHERE s.associado_id = ?
       ORDER BY s.created_at DESC`,
      [associadoId]
    ) as Promise<SolicitacaoGrupo[]>;
  }

  async aprovarSolicitacao(solicitacaoId: number): Promise<void> {
    const solicitacao = (await dbGet(
      "SELECT * FROM solicitacoes_grupo WHERE id = ?",
      [solicitacaoId]
    )) as SolicitacaoGrupo | null;

    if (!solicitacao) {
      throw new Error("Solicitação não encontrada");
    }

    // Adicionar associado ao grupo
    await this.adicionarAssociado(
      solicitacao.grupo_id!,
      solicitacao.associado_id,
      "solicitacao"
    );

    // Atualizar status da solicitação
    await dbRun(
      "UPDATE solicitacoes_grupo SET status = 'aprovada', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [solicitacaoId]
    );
  }

  async rejeitarSolicitacao(solicitacaoId: number): Promise<void> {
    await dbRun(
      "UPDATE solicitacoes_grupo SET status = 'rejeitada', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [solicitacaoId]
    );
  }

  async aceitarConvite(
    linkConvite: string,
    associadoId: number
  ): Promise<Grupo> {
    const grupo = await this.buscarPorLinkConvite(linkConvite);
    if (!grupo) {
      throw new Error("Link de convite inválido");
    }

    // Verificar se já está no grupo
    const jaEstaNoGrupo = await dbGet(
      "SELECT * FROM grupo_associados WHERE grupo_id = ? AND associado_id = ?",
      [grupo.id, associadoId]
    );

    if (jaEstaNoGrupo) {
      throw new Error("Você já está neste grupo");
    }

    await this.adicionarAssociado(grupo.id!, associadoId, "convite");
    return grupo;
  }
}
