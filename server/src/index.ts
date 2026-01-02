import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db';
import { popularDadosFake } from './scripts/populateFakeData';
import associadosRouter from './routes/associados';
import rodadasRouter from './routes/rodadas';
import gruposRouter from './routes/grupos';
import rankingRouter from './routes/ranking';
import importacaoRouter from './routes/importacao';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/associados', associadosRouter);
app.use('/api/rodadas', rodadasRouter);
app.use('/api/grupos', gruposRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/importacao', importacaoRouter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rota para popular banco com dados fake (apenas para desenvolvimento/deploy)
app.post('/api/admin/populate', async (req, res) => {
  try {
    console.log('🔄 Populando banco com dados fake via API...');
    await popularDadosFake();
    res.json({
      success: true,
      message: 'Banco populado com sucesso!',
      note: 'Verifique o console do servidor para ver os links de convite gerados.'
    });
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao popular banco de dados',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Inicializar banco de dados e servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  });

