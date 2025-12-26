# Changelog - Sistema de Grupos e Convites

## Funcionalidades Implementadas

### 1. Sistema de Grupos com Configurações de Partida
- ✅ Criação de grupos com configurações completas
- ✅ Duração da partida (em minutos)
- ✅ Local da partida
- ✅ Horário da partida
- ✅ Frequência (semanal, quinzenal, mensal)
- ✅ Tipo de time (fixo ou dinâmico)

### 2. Sistema de Convites
- ✅ Geração automática de link único por grupo
- ✅ Link de convite persistente
- ✅ Aceitar convite via link
- ✅ Regenerar link de convite

### 3. Sistema de Solicitações
- ✅ Associado pode solicitar entrada no grupo
- ✅ Administradores podem aprovar/rejeitar solicitações
- ✅ Listagem de solicitações pendentes por grupo
- ✅ Histórico de solicitações por associado

### 4. Times Fixos vs Dinâmicos
- ✅ Configuração por grupo (fixo ou dinâmico)
- ✅ Times fixos: sorteio antes do jogo
- ✅ Times dinâmicos: estatísticas a nível de jogador
- ✅ Jogos vinculados a grupos

### 5. Fluxo Completo
- ✅ Associado se cadastra
- ✅ Entra em grupo via convite ou solicitação
- ✅ Administrador define sistemática das partidas
- ✅ Partidas podem ter times fixos ou dinâmicos

## Estrutura de Dados

### Tabelas Criadas/Atualizadas
- `grupos`: Adicionados campos de configuração de partida
- `grupo_associados`: Adicionado status e criado_via
- `solicitacoes_grupo`: Nova tabela para solicitações
- `jogos`: Adicionado grupo_id e tipo_time

## API Endpoints

### Grupos
- `GET /api/grupos/convite/:linkConvite` - Buscar grupo por link
- `POST /api/grupos/convite/:linkConvite/aceitar` - Aceitar convite
- `POST /api/grupos/:id/gerar-link` - Gerar novo link
- `POST /api/grupos/:id/solicitar-entrada` - Solicitar entrada
- `GET /api/grupos/:id/solicitacoes` - Listar solicitações
- `GET /api/grupos/associado/:associadoId/solicitacoes` - Solicitações do associado
- `POST /api/grupos/solicitacoes/:id/aprovar` - Aprovar solicitação
- `POST /api/grupos/solicitacoes/:id/rejeitar` - Rejeitar solicitação

## Próximos Passos (Frontend)

1. Atualizar página de Grupos para incluir:
   - Formulário com configurações de partida
   - Link de convite com botão copiar
   - Seção de solicitações pendentes

2. Criar página de Buscar Grupos:
   - Listar grupos públicos
   - Solicitar entrada
   - Aceitar convite via link

3. Atualizar página de Jogos:
   - Filtrar por grupo
   - Mostrar tipo de time (fixo/dinâmico)
   - Sorteio apenas para times fixos





