import { Router } from 'express';
import multer from 'multer';
import { ImportacaoService } from '../services/ImportacaoService';

const router = Router();
const importacaoService = new ImportacaoService();

// Configurar multer para armazenar arquivo em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas Excel e CSV
    const extensoesPermitidas = ['.xlsx', '.xls', '.csv'];
    const extensao = file.originalname.toLowerCase().substring(
      file.originalname.lastIndexOf('.')
    );
    
    if (extensoesPermitidas.includes(extensao)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv'));
    }
  }
});

/**
 * Rota para importar associados de um arquivo Excel/CSV
 * POST /api/importacao/grupo/:grupoId
 * 
 * Body (multipart/form-data):
 * - file: arquivo Excel ou CSV
 * 
 * Formato esperado do arquivo:
 * - Colunas: nome, apelido, posicao
 * - Pode ter cabeçalho ou não
 */
router.post('/grupo/:grupoId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const grupoId = parseInt(req.params.grupoId);
    if (isNaN(grupoId)) {
      return res.status(400).json({ error: 'ID do grupo inválido' });
    }

    // Determinar extensão do arquivo
    const extensao = req.file.originalname
      .toLowerCase()
      .substring(req.file.originalname.lastIndexOf('.'));

    // Processar importação
    const resultado = await importacaoService.importarAssociados(
      req.file.buffer,
      extensao,
      grupoId
    );

    res.json({
      message: 'Importação concluída',
      resultado
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

