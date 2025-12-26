# Instruções para Testar com Dados Fake

## Como Popular o Banco de Dados

### Opção 1: Via npm script (recomendado)

```bash
cd server
npm run populate
```

### Opção 2: Executar diretamente

```bash
cd server
npx tsx src/scripts/populateFakeData.ts
```

## Dados Criados

### Associados (15)
- João (Goleiro)
- Pedro (Zagueiro)
- Carlos (Zagueiro)
- Lucas (Lateral)
- Marcos (Lateral)
- Rafa (Volante)
- Bruno (Volante)
- Felipe (Meia)
- Gabriel (Meia)
- Thiago (Meia)
- André (Atacante)
- Ricardo (Atacante)
- Daniel (Atacante)
- Eduardo (Goleiro)
- Fernando (Zagueiro)

### Grupos (3)

1. **Pelada do Sábado**
   - Semanal, 90 minutos
   - Campo do Bairro, 08:00
   - Times fixos
   - Link de convite será exibido no console

2. **Futebol da Tarde**
   - Quinzenal, 60 minutos
   - Quadra Coberta, 16:00
   - Times dinâmicos
   - Link de convite será exibido no console

3. **Pelada Mensal**
   - Mensal, 120 minutos
   - Campo Principal, 10:00
   - Times fixos
   - Link de convite será exibido no console

### Jogos
- 4 jogos do primeiro grupo (últimas 4 semanas)
- 2 jogos do segundo grupo (últimas 2 quinzenas)
- 1 jogo do terceiro grupo (mês passado)

### Dados Gerados
- ✅ Confirmações (80% dos associados confirmam)
- ✅ Presenças (90% dos que confirmaram comparecem)
- ✅ Times divididos (para jogos com times fixos)
- ✅ Resultados (para jogos com times fixos)
- ✅ Estatísticas (gols, assistências, cartões)
- ✅ Solicitações pendentes (alguns associados solicitando entrada)

## Testando no Frontend

1. **Associados**
   - Acesse `/associados` para ver todos os associados
   - Veja os grupos de cada associado

2. **Grupos**
   - Acesse `/grupos` para ver todos os grupos
   - Clique em um grupo para ver detalhes
   - Veja os links de convite no console após popular

3. **Convites**
   - Use o link de convite para aceitar entrada em um grupo
   - Endpoint: `POST /api/grupos/convite/:linkConvite/aceitar`

4. **Solicitações**
   - Veja solicitações pendentes em cada grupo
   - Aprove ou rejeite solicitações

5. **Jogos**
   - Acesse `/jogos` para ver os jogos criados
   - Veja confirmações e presenças
   - Para jogos com times fixos, veja os times sorteados
   - Para jogos dinâmicos, veja apenas estatísticas individuais

6. **Estatísticas**
   - Acesse `/estatisticas` para ver rankings
   - Filtre por período (semanal, mensal, anual)

## Limpar Dados

Para limpar e recriar os dados:

```bash
# Deletar o banco de dados
rm server/data/piloto-baba.db

# Recriar com dados fake
cd server
npm run populate
```

## Notas

- Os dados são criados com `INSERT OR IGNORE`, então executar múltiplas vezes não duplicará dados
- Links de convite são únicos e aleatórios
- Estatísticas são geradas aleatoriamente para simular dados realistas
- Alguns associados têm solicitações pendentes para testar o fluxo de aprovação





