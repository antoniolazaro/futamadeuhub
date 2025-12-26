import { Router } from 'express';
import { AssociadoService } from '../services/AssociadoService';

const router = Router();
const associadoService = new AssociadoService();

router.get('/', async (req, res) => {
  try {
    const associados = await associadoService.listar();
    res.json(associados);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const associado = await associadoService.buscarPorId(parseInt(req.params.id));
    if (!associado) {
      return res.status(404).json({ error: 'Associado não encontrado' });
    }
    res.json(associado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const associado = await associadoService.criar(req.body);
    res.status(201).json(associado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await associadoService.atualizar(parseInt(req.params.id), req.body);
    res.json({ message: 'Associado atualizado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await associadoService.deletar(parseInt(req.params.id));
    res.json({ message: 'Associado deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/estatisticas', async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const periodo = inicio || fim ? { inicio: inicio as string, fim: fim as string } : undefined;
    const estatisticas = await associadoService.calcularEstatisticas(
      parseInt(req.params.id),
      periodo
    );
    res.json(estatisticas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





