import * as XLSX from 'xlsx';
import { AssociadoService } from './AssociadoService';
import { GrupoService } from './GrupoService';
import { Associado } from '../models/Associado';

export interface LinhaImportacao {
  nome: string;
  apelido: string;
  posicao: string;
}

export interface ResultadoImportacao {
  sucesso: number;
  erros: Array<{ linha: number; apelido: string; erro: string }>;
  duplicados: Array<{ linha: number; apelido: string }>;
}

export class ImportacaoService {
  private associadoService: AssociadoService;
  private grupoService: GrupoService;

  constructor() {
    this.associadoService = new AssociadoService();
    this.grupoService = new GrupoService();
  }

  /**
   * Processa arquivo Excel ou CSV e retorna array de linhas
   */
  processarArquivo(buffer: Buffer, extensao: string): LinhaImportacao[] {
    let workbook: XLSX.WorkBook;
    
    if (extensao === '.csv') {
      // Para CSV, converter string para workbook
      const csvString = buffer.toString('utf-8');
      workbook = XLSX.read(csvString, { type: 'string' });
    } else {
      // Para Excel (.xlsx, .xls)
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }

    // Pegar primeira planilha
    const primeiraPlanilha = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primeiraPlanilha];

    // Converter para JSON
    const dados = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    }) as any[][];

    // Verificar se tem cabeçalho
    const temCabecalho = this.temCabecalho(dados[0]);
    const inicioDados = temCabecalho ? 1 : 0;

    // Mapear colunas (buscar por nome da coluna ou posição)
    const linhas: LinhaImportacao[] = [];
    
    for (let i = inicioDados; i < dados.length; i++) {
      const linha = dados[i];
      
      if (!linha || linha.length === 0) continue;
      
      let nome = '';
      let apelido = '';
      let posicao = '';

      if (temCabecalho) {
        // Buscar por nome da coluna no cabeçalho
        const cabecalho = dados[0];
        const nomeIndex = this.encontrarColuna(cabecalho, ['nome', 'name']);
        const apelidoIndex = this.encontrarColuna(cabecalho, ['apelido', 'nickname', 'nick']);
        const posicaoIndex = this.encontrarColuna(cabecalho, ['posicao', 'posição', 'position', 'pos']);

        // Se não encontrou pelo nome, usar ordem padrão
        if (nomeIndex >= 0) {
          nome = linha[nomeIndex]?.toString().trim() || '';
        } else {
          nome = linha[0]?.toString().trim() || '';
        }
        
        if (apelidoIndex >= 0) {
          apelido = linha[apelidoIndex]?.toString().trim() || '';
        } else {
          apelido = linha[1]?.toString().trim() || '';
        }
        
        if (posicaoIndex >= 0) {
          posicao = linha[posicaoIndex]?.toString().trim() || '';
        } else {
          posicao = linha[2]?.toString().trim() || '';
        }
      } else {
        // Assumir ordem: nome, apelido, posição
        nome = linha[0]?.toString().trim() || '';
        apelido = linha[1]?.toString().trim() || '';
        posicao = linha[2]?.toString().trim() || '';
      }

      // Validar linha
      if (!nome || !apelido || !posicao) {
        continue; // Pular linhas incompletas
      }

      linhas.push({ nome, apelido, posicao });
    }

    return linhas;
  }

  /**
   * Verifica se a primeira linha é um cabeçalho
   */
  private temCabecalho(primeiraLinha: any[]): boolean {
    if (!primeiraLinha || primeiraLinha.length === 0) return false;
    
    const texto = primeiraLinha.map(c => c?.toString().toLowerCase() || '').join('');
    return texto.includes('nome') || texto.includes('apelido') || texto.includes('posicao');
  }

  /**
   * Encontra o índice da coluna por nomes possíveis
   */
  private encontrarColuna(cabecalho: any[], nomes: string[]): number {
    for (let i = 0; i < cabecalho.length; i++) {
      const valor = cabecalho[i]?.toString().toLowerCase().trim() || '';
      if (nomes.some(nome => valor.includes(nome.toLowerCase()))) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Importa associados de um arquivo e vincula ao grupo
   */
  async importarAssociados(
    buffer: Buffer,
    extensao: string,
    grupoId: number
  ): Promise<ResultadoImportacao> {
    // Validar grupo
    const grupo = await this.grupoService.buscarPorId(grupoId);
    if (!grupo) {
      throw new Error('Grupo não encontrado');
    }

    // Processar arquivo
    const linhas = this.processarArquivo(buffer, extensao);

    if (linhas.length === 0) {
      throw new Error('Nenhum dado válido encontrado no arquivo');
    }

    const resultado: ResultadoImportacao = {
      sucesso: 0,
      erros: [],
      duplicados: []
    };

    // Processar cada linha
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      const numeroLinha = i + 1;

      try {
        // Verificar se associado já existe pelo apelido
        const associadosExistentes = await this.associadoService.listar();
        const associadoExistente = associadosExistentes.find(
          a => a.apelido.toLowerCase() === linha.apelido.toLowerCase()
        );

        let associadoId: number;

        if (associadoExistente) {
          // Associado já existe - verificar se já está no grupo
          associadoId = associadoExistente.id!;
          
          const gruposAssociado = await this.grupoService.buscarGruposPorAssociado(associadoId);
          const jaEstaNoGrupo = gruposAssociado.some(g => g.id === grupoId);

          if (jaEstaNoGrupo) {
            resultado.duplicados.push({
              linha: numeroLinha,
              apelido: linha.apelido
            });
            continue;
          }

          // Atualizar posição se necessário
          if (associadoExistente.posicao !== linha.posicao) {
            await this.associadoService.atualizar(associadoId, {
              posicao: linha.posicao
            });
          }
        } else {
          // Criar novo associado
          const novoAssociado = await this.associadoService.criar({
            nome: linha.nome,
            apelido: linha.apelido,
            posicao: linha.posicao
          });
          associadoId = novoAssociado.id!;
        }

        // Vincular ao grupo
        await this.grupoService.adicionarAssociado(grupoId, associadoId, 'convite');
        resultado.sucesso++;

      } catch (error: any) {
        resultado.erros.push({
          linha: numeroLinha,
          apelido: linha.apelido,
          erro: error.message || 'Erro desconhecido'
        });
      }
    }

    return resultado;
  }
}

