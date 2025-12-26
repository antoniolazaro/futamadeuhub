import { Router } from "express";
import { GrupoService } from "../services/GrupoService";

const router = Router();
const grupoService = new GrupoService();

router.get("/", async (req, res) => {
  try {
    const grupos = await grupoService.listar();
    res.json(grupos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const grupo = await grupoService.buscarCompleto(parseInt(req.params.id));
    if (!grupo) {
      return res.status(404).json({ error: "Grupo não encontrado" });
    }
    res.json(grupo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const grupo = await grupoService.criar(req.body);
    res.status(201).json(grupo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await grupoService.atualizar(parseInt(req.params.id), req.body);
    res.json({ message: "Grupo atualizado com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await grupoService.deletar(parseInt(req.params.id));
    res.json({ message: "Grupo deletado com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/responsaveis", async (req, res) => {
  try {
    await grupoService.adicionarResponsavel(
      parseInt(req.params.id),
      req.body.associado_id
    );
    res.json({ message: "Responsável adicionado com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/responsaveis/:associadoId", async (req, res) => {
  try {
    await grupoService.removerResponsavel(
      parseInt(req.params.id),
      parseInt(req.params.associadoId)
    );
    res.json({ message: "Responsável removido com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/responsaveis", async (req, res) => {
  try {
    const responsaveis = await grupoService.listarResponsaveis(
      parseInt(req.params.id)
    );
    res.json(responsaveis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/associados", async (req, res) => {
  try {
    await grupoService.adicionarAssociado(
      parseInt(req.params.id),
      req.body.associado_id
    );
    res.json({ message: "Associado adicionado ao grupo com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/associados/:associadoId", async (req, res) => {
  try {
    await grupoService.removerAssociado(
      parseInt(req.params.id),
      parseInt(req.params.associadoId)
    );
    res.json({ message: "Associado removido do grupo com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/associados", async (req, res) => {
  try {
    const associados = await grupoService.listarAssociados(
      parseInt(req.params.id)
    );
    res.json(associados);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/associado/:associadoId", async (req, res) => {
  try {
    const grupos = await grupoService.buscarGruposPorAssociado(
      parseInt(req.params.associadoId)
    );
    res.json(grupos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/responsavel/:associadoId", async (req, res) => {
  try {
    const grupos = await grupoService.buscarGruposComoResponsavel(
      parseInt(req.params.associadoId)
    );
    res.json(grupos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/convite/:linkConvite", async (req, res) => {
  try {
    const grupo = await grupoService.buscarPorLinkConvite(req.params.linkConvite);
    if (!grupo) {
      return res.status(404).json({ error: "Link de convite inválido" });
    }
    res.json(grupo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/convite/:linkConvite/aceitar", async (req, res) => {
  try {
    const grupo = await grupoService.aceitarConvite(
      req.params.linkConvite,
      req.body.associado_id
    );
    res.json({ message: "Convite aceito com sucesso", grupo });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/:id/gerar-link", async (req, res) => {
  try {
    const novoLink = await grupoService.gerarNovoLinkConvite(parseInt(req.params.id));
    res.json({ link_convite: novoLink });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/solicitar-entrada", async (req, res) => {
  try {
    const solicitacao = await grupoService.criarSolicitacao({
      grupo_id: parseInt(req.params.id),
      associado_id: req.body.associado_id,
      mensagem: req.body.mensagem
    });
    res.status(201).json(solicitacao);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id/solicitacoes", async (req, res) => {
  try {
    const solicitacoes = await grupoService.listarSolicitacoes(parseInt(req.params.id));
    res.json(solicitacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/associado/:associadoId/solicitacoes", async (req, res) => {
  try {
    const solicitacoes = await grupoService.listarSolicitacoesPorAssociado(
      parseInt(req.params.associadoId)
    );
    res.json(solicitacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/solicitacoes/:id/aprovar", async (req, res) => {
  try {
    await grupoService.aprovarSolicitacao(parseInt(req.params.id));
    res.json({ message: "Solicitação aprovada com sucesso" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/solicitacoes/:id/rejeitar", async (req, res) => {
  try {
    await grupoService.rejeitarSolicitacao(parseInt(req.params.id));
    res.json({ message: "Solicitação rejeitada" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

