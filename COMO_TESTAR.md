# ⚠️ ATENÇÃO: Este arquivo foi substituído por TESTE_APLICACAO.md

# Como Testar o Sistema Piloto Baba

## 1. Instalação Inicial

### Instalar dependências do backend
```bash
cd server
npm install
```

### Instalar dependências do frontend
```bash
cd client
npm install
```

### Instalar dependências da raiz (opcional, para rodar tudo junto)
```bash
npm install
```

## 2. Popular Banco de Dados com Dados Fake

```bash
cd server
npm run populate
```

Isso criará:
- ✅ 15 associados
- ✅ 3 grupos com configurações diferentes
- ✅ 7 jogos (4 semanais, 2 quinzenais, 1 mensal)
- ✅ Confirmações e presenças
- ✅ Times divididos (para jogos fixos)
- ✅ Resultados e estatísticas
- ✅ Solicitações pendentes

**Importante:** Os links de convite serão exibidos no console após executar o script!

## 3. Iniciar o Servidor Backend

Em um terminal:
```bash
cd server
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 4. Iniciar o Frontend

Em outro terminal:
```bash
cd client
npm start
```

O frontend estará rodando em: `http://localhost:3000`

## 5. Testar Funcionalidades

### 5.1 Testar via Interface Web

1. **Acesse** `http://localhost:3000`
2. **Navegue pelas páginas:**
   - Dashboard - Veja o ranking geral
   - Associados - Veja todos os associados e seus grupos
   - Grupos - Veja grupos, configurações e links de convite
   - Jogos - Veja jogos, confirmações, presenças e times
   - Calendário - Veja jogos no calendário mensal
   - Estatísticas - Veja rankings e estatísticas detalhadas

### 5.2 Testar via API (usando curl ou Postman)

#### Associados
```bash
# Listar todos os associados
curl http://localhost:3001/api/associados

# Buscar associado específico
curl http://localhost:3001/api/associados/1

# Ver estatísticas de um associado
curl http://localhost:3001/api/associados/1/estatisticas
```

#### Grupos
```bash
# Listar todos os grupos
curl http://localhost:3001/api/grupos

# Buscar grupo completo (com responsáveis e associados)
curl http://localhost:3001/api/grupos/1

# Buscar grupos de um associado
curl http://localhost:3001/api/grupos/associado/1

# Ver solicitações pendentes de um grupo
curl http://localhost:3001/api/grupos/1/solicitacoes
```

#### Convites
```bash
# Buscar grupo por link de convite (use um link do console)
curl http://localhost:3001/api/grupos/convite/SEU_LINK_AQUI

# Aceitar convite (substitua associado_id e link)
curl -X POST http://localhost:3001/api/grupos/convite/SEU_LINK_AQUI/aceitar \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1}'
```

#### Jogos
```bash
# Listar jogos
curl http://localhost:3001/api/jogos

# Buscar jogo específico
curl http://localhost:3001/api/jogos/1

# Ver confirmações de um jogo
curl http://localhost:3001/api/jogos/1/confirmacoes

# Ver presenças de um jogo
curl http://localhost:3001/api/jogos/1/presencas

# Ver times de um jogo
curl http://localhost:3001/api/jogos/1/times

# Ver resultado de um jogo
curl http://localhost:3001/api/jogos/1/resultado

# Ver estatísticas de um jogo
curl http://localhost:3001/api/jogos/1/estatisticas
```

### 5.3 Testar Fluxo Completo

#### Cenário 1: Associado entra via convite
1. Execute `npm run populate` e copie um link de convite
2. Use a API para aceitar o convite:
```bash
curl -X POST http://localhost:3001/api/grupos/convite/LINK_AQUI/aceitar \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1}'
```
3. Verifique que o associado foi adicionado ao grupo

#### Cenário 2: Associado solicita entrada
1. Criar solicitação:
```bash
curl -X POST http://localhost:3001/api/grupos/1/solicitar-entrada \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 10, "mensagem": "Quero participar!"}'
```
2. Ver solicitações pendentes:
```bash
curl http://localhost:3001/api/grupos/1/solicitacoes
```
3. Aprovar solicitação:
```bash
curl -X POST http://localhost:3001/api/grupos/solicitacoes/1/aprovar
```

#### Cenário 3: Criar e gerenciar jogo
1. Criar jogo:
```bash
curl -X POST http://localhost:3001/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"data": "2024-01-15", "tipo": "semanal", "grupo_id": 1, "tipo_time": "fixo"}'
```
2. Confirmar presença:
```bash
curl -X POST http://localhost:3001/api/jogos/1/confirmar \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1, "confirmado": true}'
```
3. Fazer check-in:
```bash
curl -X POST http://localhost:3001/api/jogos/1/checkin \
  -H "Content-Type: application/json" \
  -d '{"associado_id": 1, "presente": true}'
```
4. Sortear times (se tipo_time = "fixo"):
```bash
curl -X POST http://localhost:3001/api/jogos/1/sortear-times
```
5. Registrar resultado:
```bash
curl -X POST http://localhost:3001/api/jogos/1/resultado \
  -H "Content-Type: application/json" \
  -d '{"time_a_gols": 3, "time_b_gols": 2}'
```

## 6. Verificar Dados no Banco

O banco de dados SQLite está em: `server/data/piloto-baba.db`

Você pode usar ferramentas como:
- **DB Browser for SQLite** (GUI)
- **sqlite3** (linha de comando)

```bash
cd server/data
sqlite3 piloto-baba.db

# Exemplos de queries:
SELECT * FROM associados;
SELECT * FROM grupos;
SELECT * FROM jogos;
SELECT COUNT(*) FROM presencas WHERE presente = 1;
```

## 7. Limpar e Recriar Dados

Para limpar tudo e começar do zero:

```bash
# Deletar banco de dados
rm server/data/piloto-baba.db

# Recriar com dados fake
cd server
npm run populate
```

## 8. Testar Responsividade

1. Abra o frontend no navegador
2. Abra as ferramentas de desenvolvedor (F12)
3. Use o modo de dispositivo responsivo
4. Teste em diferentes tamanhos de tela:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

## 9. Checklist de Testes

### Backend
- [ ] API responde corretamente
- [ ] Criar associado funciona
- [ ] Criar grupo funciona
- [ ] Link de convite funciona
- [ ] Solicitações funcionam
- [ ] Criar jogo funciona
- [ ] Confirmações funcionam
- [ ] Check-in funciona
- [ ] Sorteio de times funciona
- [ ] Estatísticas são calculadas corretamente

### Frontend
- [ ] Páginas carregam corretamente
- [ ] Navegação funciona
- [ ] Formulários salvam dados
- [ ] Modais abrem/fecham
- [ ] Tabelas exibem dados
- [ ] Calendário mostra jogos
- [ ] Estatísticas são exibidas
- [ ] Design é responsivo

### Integração
- [ ] Frontend comunica com backend
- [ ] Dados são salvos corretamente
- [ ] Atualizações refletem imediatamente
- [ ] Erros são tratados adequadamente

## 10. Problemas Comuns

### Erro: "tsx: command not found"
**Solução:** Instale as dependências do backend
```bash
cd server && npm install
```

### Erro: "Cannot find module"
**Solução:** Verifique se todas as dependências estão instaladas
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### Banco de dados não existe
**Solução:** Execute o script de população
```bash
cd server && npm run populate
```

### Porta já em uso
**Solução:** Pare outros processos ou mude a porta no código

## Dicas

1. **Use o console do navegador** para ver erros do frontend
2. **Use o terminal do servidor** para ver logs do backend
3. **Teste um fluxo completo** do início ao fim
4. **Verifique os dados no banco** se algo não funcionar
5. **Limpe e recrie** os dados se necessário

## Próximos Passos

Após testar, você pode:
- Adicionar mais funcionalidades
- Melhorar a interface
- Adicionar autenticação
- Implementar notificações
- Adicionar testes automatizados

