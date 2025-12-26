import { Router } from "express";
import { RodadaService } from "../services/RodadaService";
import { dbGet } from "../database/db";

const router = Router();
const rodadaService = new RodadaService();

// ========== ROTAS DE RODADAS ==========
router.get("/", async (req, res) => {
  try {
    const { grupo_id, inicio, fim } = req.query;
    const rodadas = await rodadaService.listarRodadas({
      grupo_id: grupo_id ? parseInt(grupo_id as string) : undefined,
      inicio: inicio as string,
      fim: fim as string,
    });
    res.json(rodadas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const rodada = await rodadaService.criarRodada({
      grupo_id: req.body.grupo_id,
      data: req.body.data,
      quantidade_times: req.body.quantidade_times || 2,
      tipo_divisao: req.body.tipo_divisao || "sorteio",
      formato_tipo: req.body.formato_tipo || "tempo",
      formato_valor: req.body.formato_valor,
      quantidade_tempos: req.body.quantidade_tempos,
    });
    res.status(201).json(rodada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rodada = await rodadaService.buscarRodadaPorId(
      parseInt(req.params.id)
    );
    if (!rodada) {
      return res.status(404).json({ error: "Rodada não encontrada" });
    }
    res.json(rodada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/confirmar", async (req, res) => {
  try {
    await rodadaService.confirmarPresenca({
      associado_id: req.body.associado_id,
      rodada_id: parseInt(req.params.id),
      confirmado: req.body.confirmado,
    });
    res.json({ message: "Confirmação registrada" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/checkin", async (req, res) => {
  try {
    await rodadaService.fazerCheckin({
      associado_id: req.body.associado_id,
      rodada_id: parseInt(req.params.id),
      presente: req.body.presente,
    });
    res.json({ message: "Check-in realizado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/confirmacoes", async (req, res) => {
  try {
    const confirmacoes = await rodadaService.listarConfirmacoes(
      parseInt(req.params.id)
    );
    res.json(confirmacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/presencas", async (req, res) => {
  try {
    const presencas = await rodadaService.listarPresencas(
      parseInt(req.params.id)
    );
    res.json(presencas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/dividir-times", async (req, res) => {
  try {
    // Validar quantidade máxima de times baseado na quantidade de jogadores
    const rodada = await rodadaService.buscarRodadaPorId(parseInt(req.params.id));
    if (!rodada) {
      return res.status(404).json({ error: "Rodada não encontrada" });
    }

    const grupo = await dbGet(
      "SELECT quantidade_jogadores_linha FROM grupos WHERE id = ?",
      [rodada.grupo_id]
    ) as { quantidade_jogadores_linha: number } | null;

    const quantidadeJogadoresLinha = grupo?.quantidade_jogadores_linha || 10;
    const totalJogadores = req.body.divisao?.length || 0;
    const quantidadeMaximaTimes = Math.floor(totalJogadores / quantidadeJogadoresLinha);

    // Verificar se a quantidade de times não excede o máximo
    const timesUnicos = new Set(req.body.divisao?.map((d: any) => d.time) || []);
    if (timesUnicos.size > quantidadeMaximaTimes) {
      return res.status(400).json({ 
        error: `Quantidade máxima de times permitida: ${quantidadeMaximaTimes} (baseado em ${totalJogadores} jogadores / ${quantidadeJogadoresLinha} por time)` 
      });
    }

    await rodadaService.dividirTimes(parseInt(req.params.id), req.body.divisao);
    res.json({ message: "Times divididos com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/sortear-times", async (req, res) => {
  try {
    await rodadaService.sortearTimes(parseInt(req.params.id));
    res.json({ message: "Times sorteados com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/times", async (req, res) => {
  try {
    const times = await rodadaService.buscarTimesRodada(parseInt(req.params.id));
    res.json(times);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/resultado", async (req, res) => {
  try {
    await rodadaService.salvarResultado({
      rodada_id: parseInt(req.params.id),
      time_nome: req.body.time_nome,
      gols: req.body.gols,
    });
    res.json({ message: "Resultado salvo com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/resultados", async (req, res) => {
  try {
    const resultados = await rodadaService.buscarResultadosRodada(
      parseInt(req.params.id)
    );
    res.json(resultados);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/estatisticas", async (req, res) => {
  try {
    await rodadaService.salvarEstatisticas({
      associado_id: req.body.associado_id,
      rodada_id: parseInt(req.params.id),
      gols: req.body.gols || 0,
      assistencias: req.body.assistencias || 0,
      cartao_amarelo: req.body.cartao_amarelo || 0,
      cartao_azul: req.body.cartao_azul || 0,
      cartao_vermelho: req.body.cartao_vermelho || 0,
      cartao_azul_vermelho: req.body.cartao_azul_vermelho || 0,
    });
    res.json({ message: "Estatísticas salvas com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/estatisticas", async (req, res) => {
  try {
    const estatisticas = await rodadaService.buscarEstatisticasRodada(
      parseInt(req.params.id)
    );
    res.json(estatisticas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/eleicao", async (req, res) => {
  try {
    await rodadaService.votarEleicao({
      rodada_id: parseInt(req.params.id),
      tipo: req.body.tipo,
      associado_id: req.body.associado_id,
      votos: 0, // Será incrementado no serviço
    });
    res.json({ message: "Voto registrado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/eleicoes", async (req, res) => {
  try {
    const eleicoes = await rodadaService.buscarEleicoes(parseInt(req.params.id));
    res.json(eleicoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/gol-mais-bonito", async (req, res) => {
  try {
    await rodadaService.votarGolMaisBonito({
      rodada_id: parseInt(req.params.id),
      associado_id: req.body.associado_id,
      descricao: req.body.descricao,
      votos: 0,
    });
    res.json({ message: "Voto registrado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/gols-mais-bonitos", async (req, res) => {
  try {
    const gols = await rodadaService.buscarGolsMaisBonitos(
      parseInt(req.params.id)
    );
    res.json(gols);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTAS DE PARTIDAS ==========
router.get("/:id/partidas", async (req, res) => {
  try {
    const partidas = await rodadaService.listarPartidas(parseInt(req.params.id));
    res.json(partidas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/partidas", async (req, res) => {
  try {
    const partida = await rodadaService.criarPartida({
      rodada_id: parseInt(req.params.id),
      numero: 0, // Será calculado automaticamente
    });
    res.status(201).json(partida);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/partidas/:id", async (req, res) => {
  try {
    const partida = await rodadaService.buscarPartidaPorId(parseInt(req.params.id));
    if (!partida) {
      return res.status(404).json({ error: "Partida não encontrada" });
    }
    res.json(partida);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/partidas/:id/finalizar", async (req, res) => {
  try {
    await rodadaService.finalizarPartida(parseInt(req.params.id));
    res.json({ message: "Partida finalizada" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/partidas/:id/sortear-times", async (req, res) => {
  try {
    const usarTimesRodada = req.body.usar_times_rodada || false;
    await rodadaService.sortearTimesPartida(parseInt(req.params.id), usarTimesRodada);
    res.json({ message: "Times sorteados com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/partidas/:id/dividir-times", async (req, res) => {
  try {
    await rodadaService.dividirTimesPartida(parseInt(req.params.id), req.body.divisao);
    res.json({ message: "Times divididos com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/partidas/:id/times", async (req, res) => {
  try {
    const times = await rodadaService.buscarTimesPartida(parseInt(req.params.id));
    res.json(times);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/partidas/:id/resultado", async (req, res) => {
  try {
    await rodadaService.salvarResultadoPartida({
      partida_id: parseInt(req.params.id),
      time_nome: req.body.time_nome,
      gols: req.body.gols,
    });
    res.json({ message: "Resultado salvo com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/partidas/:id/resultados", async (req, res) => {
  try {
    const resultados = await rodadaService.buscarResultadosPartida(parseInt(req.params.id));
    res.json(resultados);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/partidas/:id/estatisticas", async (req, res) => {
  try {
    await rodadaService.salvarEstatisticasPartida({
      associado_id: req.body.associado_id,
      partida_id: parseInt(req.params.id),
      gols: req.body.gols || 0,
      assistencias: req.body.assistencias || 0,
      cartao_amarelo: req.body.cartao_amarelo || 0,
      cartao_azul: req.body.cartao_azul || 0,
      cartao_vermelho: req.body.cartao_vermelho || 0,
      cartao_azul_vermelho: req.body.cartao_azul_vermelho || 0,
    });
    res.json({ message: "Estatísticas salvas com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/partidas/:id/estatisticas", async (req, res) => {
  try {
    const estatisticas = await rodadaService.buscarEstatisticasPartida(parseInt(req.params.id));
    res.json(estatisticas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

