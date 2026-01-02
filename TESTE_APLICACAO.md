# Guia Completo para Testar a Aplicação

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- Node.js (v16 ou superior)
- npm ou yarn

## 🚀 Passo a Passo para Testar

### 1. Instalar Dependências

```bash
# Na raiz do projeto
npm install

# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### 2. Popular Banco de Dados com Dados Fake

```bash
cd server
npm run populate
```

**O que será criado:**
- ✅ 15 associados (João, Pedro, Carlos, etc.)
- ✅ 3 grupos com configurações diferentes
- ✅ 7 jogos (4 semanais, 2 quinzenais, 1 mensal)
- ✅ Confirmações e presenças
- ✅ Times divididos (para jogos fixos)
- ✅ Resultados e estatísticas
- ✅ Solicitações pendentes

**Importante:** Os links de convite serão exibidos no console!

### 3. Iniciar o Backend

Em um terminal:

```bash
cd server
npm run dev
```

O servidor estará rodando em: **http://localhost:3001**

Você verá: `Servidor rodando na porta 3001`

### 4. Iniciar o Frontend

Em outro terminal:

```bash
cd client
npm start
```

O frontend abrirá automaticamente em: **http://localhost:3000**

## 🧪 Testando a Interface Web

### Dashboard
1. Acesse `http://localhost:3000`
2. Veja o ranking geral dos associados
3. Navegue pelos cards de acesso rápido

### Associados
1. Clique em "Associados" no menu
2. Veja a lista de todos os associados
3. Clique em "Novo Associado" para criar um
4. Clique em "Editar" para modificar
5. Clique em "Grupos" para ver grupos do associado
6. Veja os badges de grupos na tabela

### Grupos
1. Clique em "Grupos" no menu
2. Veja a lista de grupos criados
3. Clique em um grupo para ver detalhes:
   - Responsáveis
   - Associados
   - Configurações de partida
4. Clique em "Novo Grupo" para criar
5. Adicione responsáveis e associados
6. Configure duração, local, horário, frequência
7. Escolha tipo de time (fixo ou dinâmico)

### Jogos
1. Clique em "Jogos" no menu
2. Veja lista de jogos criados
3. Clique em um jogo para ver detalhes:
   - Confirmações de presença
   - Check-ins realizados
   - Times divididos (se fixo)
   - Resultado do jogo
   - Estatísticas individuais
4. Clique em "Novo Jogo" para criar
5. Para jogos com times fixos:
   - Confirme presenças
   - Faça check-ins
   - Clique em "Sortear Times"
   - Registre resultado
6. Para jogos dinâmicos:
   - Confirme presenças
   - Faça check-ins
   - Registre apenas estatísticas individuais

### Calendário
1. Clique em "Calendário" no menu
2. Veja jogos no calendário mensal
3. Use setas para navegar entre meses
4. Filtre por tipo (semanal, mensal, anual)
5. Veja cores diferentes para cada tipo

### Estatísticas
1. Clique em "Estatísticas" no menu
2. Veja ranking completo com todas as métricas
3. Filtre por período:
   - Todos os Períodos
   - Semanal
   - Mensal
   - Anual
4. Veja:
   - Pontos totais
   - Gols e assistências
   - Vitórias, empates, derrotas
   - Média de gols
   - Percentuais
   - Frequência

## 🔌 Testando a API (Backend)

### Usando curl

#### Associados
```bash
# Listar todos
curl http://localhost:3001/api/associados

# Buscar por ID
curl http://localhost:3001/api/associados/1

# Criar novo
curl -X POST http://localhost:3001/api/associados \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","apelido":"Teste","posicao":"Atacante"}'

# Ver estatísticas
curl http://localhost:3001/api/associados/1/estatisticas
```

#### Grupos
```bash
# Listar todos
curl http://localhost:3001/api/grupos

# Buscar completo
curl http://localhost:3001/api/grupos/1

# Buscar por link de convite (use um link do console)
curl http://localhost:3001/api/grupos/convite/SEU_LINK_AQUI

# Aceitar convite
curl -X POST http://localhost:3001/api/grupos/convite/SEU_LINK_AQUI/aceitar \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1}'

# Solicitar entrada
curl -X POST http://localhost:3001/api/grupos/1/solicitar-entrada \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 10, "mensagem": "Quero participar!"}'

# Ver solicitações pendentes
curl http://localhost:3001/api/grupos/1/solicitacoes

# Aprovar solicitação
curl -X POST http://localhost:3001/api/grupos/solicitacoes/1/aprovar
```

#### Jogos
```bash
# Listar todos
curl http://localhost:3001/api/jogos

# Criar jogo
curl -X POST http://localhost:3001/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"data":"2024-01-15","tipo":"semanal","grupo_id":1,"tipo_time":"fixo"}'

# Confirmar presença
curl -X POST http://localhost:3001/api/jogos/1/confirmar \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1, "confirmado": true}'

# Fazer check-in
curl -X POST http://localhost:3001/api/jogos/1/checkin \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1, "presente": true}'

# Sortear times
curl -X POST http://localhost:3001/api/jogos/1/sortear-times

# Ver times
curl http://localhost:3001/api/jogos/1/times

# Registrar resultado
curl -X POST http://localhost:3001/api/jogos/1/resultado \
  -H "Content-Type: application/json" \
  -d '{"time_a_gols": 3, "time_b_gols": 2}'

# Ver estatísticas do jogo
curl http://localhost:3001/api/jogos/1/estatisticas
```

### Usando Postman ou Insomnia

1. Importe as rotas:
   - Base URL: `http://localhost:3001/api`
   - Métodos: GET, POST, PUT, DELETE
   
2. Teste os endpoints acima com a interface gráfica

## 📱 Testando Responsividade

1. Abra o navegador em `http://localhost:3000`
2. Pressione F12 para abrir DevTools
3. Clique no ícone de dispositivo móvel
4. Teste em diferentes tamanhos:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
5. Navegue por todas as páginas em cada tamanho

## 🔍 Verificar Dados no Banco

### Usando sqlite3 (linha de comando)

```bash
cd server/data
sqlite3 piloto-baba.db

# Exemplos de queries:
.tables                    # Ver todas as tabelas
SELECT * FROM associados;  # Ver associados
SELECT * FROM grupos;      # Ver grupos
SELECT * FROM jogos;       # Ver jogos
SELECT COUNT(*) FROM presencas WHERE presente = 1;  # Contar presenças
.quit                      # Sair
```

### Usando DB Browser for SQLite (GUI)

1. Baixe em: https://sqlitebrowser.org/
2. Abra: `server/data/piloto-baba.db`
3. Navegue pelas tabelas e dados visualmente

## 🧹 Limpar e Recriar Dados

```bash
# Deletar banco de dados
rm server/data/piloto-baba.db

# Recriar com dados fake
cd server
npm run populate
```

## ✅ Checklist de Testes

### Backend
- [ ] Servidor inicia sem erros
- [ ] API responde em `/api/health`
- [ ] Criar associado funciona
- [ ] Criar grupo funciona
- [ ] Link de convite funciona
- [ ] Aceitar convite funciona
- [ ] Solicitar entrada funciona
- [ ] Aprovar/rejeitar solicitação funciona
- [ ] Criar jogo funciona
- [ ] Confirmar presença funciona
- [ ] Check-in funciona
- [ ] Sortear times funciona
- [ ] Registrar resultado funciona
- [ ] Estatísticas são calculadas corretamente

### Frontend
- [ ] Páginas carregam sem erros
- [ ] Navegação funciona
- [ ] Formulários salvam dados
- [ ] Modais abrem/fecham
- [ ] Tabelas exibem dados corretamente
- [ ] Calendário mostra jogos
- [ ] Estatísticas são exibidas
- [ ] Design é responsivo
- [ ] Links de convite são exibidos
- [ ] Solicitações aparecem corretamente

### Integração
- [ ] Frontend comunica com backend
- [ ] Dados são salvos corretamente
- [ ] Atualizações refletem imediatamente
- [ ] Erros são tratados adequadamente
- [ ] Loading states funcionam

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
**Solução:** Instale as dependências
```bash
cd server && npm install
cd ../client && npm install
```

### Erro: "Port already in use"
**Solução:** Pare o processo na porta ou mude a porta no código

### Banco de dados não existe
**Solução:** Execute o script de população
```bash
cd server && npm run populate
```

### Frontend não conecta ao backend
**Solução:** Verifique se o backend está rodando na porta 3001

## 📊 Dados de Teste Criados

Após executar `npm run populate`, você terá:

- **15 Associados** com diferentes posições
- **3 Grupos:**
  - Pelada do Sábado (semanal, times fixos)
  - Futebol da Tarde (quinzenal, times dinâmicos)
  - Pelada Mensal (mensal, times fixos)
- **7 Jogos** distribuídos ao longo do tempo
- **Confirmações e presenças** simuladas
- **Resultados** para jogos com times fixos
- **Estatísticas** individuais
- **Solicitações pendentes** para testar aprovação

## 🎯 Próximos Passos

Após testar tudo:
1. Adicione mais funcionalidades
2. Melhore a interface
3. Adicione autenticação
4. Implemente notificações
5. Adicione testes automatizados






