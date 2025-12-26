import { Router } from "express";
import { RankingService } from "../services/RankingService";

const router = Router();
const rankingService = new RankingService();

router.get("/grupos/:grupoId", async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const ranking = await rankingService.calcularRankingGrupo(
      parseInt(req.params.grupoId),
      {
        inicio: inicio as string,
        fim: fim as string,
      }
    );
    res.json(ranking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;




