# Modelagem Conceitual Corrigida

## ✅ Correções Realizadas

### 1. **Grupo**
- ❌ **Antes:** Tinha `duracao_minutos`, `frequencia` (configurações de partida)
- ✅ **Agora:** Apenas configurações gerais:
  - `nome`, `descricao`
  - `local`, `horario` (configurações gerais do grupo)
  - `tipo_time` (fixo ou dinâmico - padrão do grupo)
  - `link_convite`

### 2. **Jogo (Evento)**
- ✅ **Agora:** Cada jogo é um evento com suas próprias configurações:
  - `data` - Data do evento
  - `grupo_id` - Grupo ao qual pertence (obrigatório)
  - `periodicidade` - semanal, quinzenal, mensal
  - `frequencia` - semanal, quinzenal, mensal
  - `duracao_minutos` - Duração em minutos
  - `tipo_time` - fixo ou dinâmico (pode sobrescrever o padrão do grupo)

### 3. **Fluxo do Jogo**
1. **Confirmação** - Associados confirmam intenção de participar
2. **Check-in** - No dia do jogo, associados fazem check-in
3. **Sorteio** - Apenas para jogos com `tipo_time = 'fixo'`
4. **Anotações**:
   - Gols e assistências (nível individual)
   - Placar (apenas para times fixos)
   - Estatísticas individuais
5. **Eleições**:
   - Craque da rodada
   - Abacaxi da rodada
   - Melhor goleiro
   - **Gol mais bonito** (NOVO)

## 📊 Estrutura de Dados

### Grupo
- Contém associados
- Define local e horário padrão
- Define tipo de time padrão (fixo/dinâmico)

### Jogo (Evento)
- Pertence a um grupo
- Tem sua própria periodicidade, frequência e duração
- Pode ter tipo de time diferente do grupo
- Contém:
  - Confirmações
  - Check-ins
  - Times (se fixo)
  - Resultado (se fixo)
  - Estatísticas individuais
  - Eleições

## 🔄 Mudanças no Banco de Dados

### Tabela `grupos`
- Removido: `duracao_minutos`, `frequencia`
- Mantido: `local`, `horario`, `tipo_time`

### Tabela `jogos`
- Adicionado: `periodicidade`, `frequencia`, `duracao_minutos`
- `grupo_id` agora é obrigatório (NOT NULL)
- `tipo_time` pode sobrescrever padrão do grupo

### Nova Tabela `gols_mais_bonitos`
- `jogo_id`
- `associado_id`
- `descricao` (opcional)
- `votos`

## 🎯 Regras de Negócio

1. **Grupo define padrões**, mas cada jogo pode ter configurações próprias
2. **Times fixos**: Requer sorteio antes do jogo, tem placar de time
3. **Times dinâmicos**: Apenas estatísticas individuais, sem placar de time
4. **Check-in obrigatório** para participar do sorteio (times fixos)
5. **Eleições** são por jogo (evento), não por grupo

## 📝 Próximos Passos

1. Atualizar frontend para refletir nova modelagem
2. Criar interface para configurar periodicidade/frequência/duração por jogo
3. Adicionar interface para votar em gol mais bonito
4. Atualizar estatísticas para considerar configurações por jogo





