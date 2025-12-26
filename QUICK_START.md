# 🚀 Quick Start - Teste Rápido

## 1️⃣ Instalar Dependências

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

## 2️⃣ Popular Dados Fake

```bash
cd server
npm run populate
```

**Copie os links de convite que aparecerem no console!**

## 3️⃣ Iniciar Backend

```bash
cd server
npm run dev
```

✅ Backend rodando em: **http://localhost:3001**

## 4️⃣ Iniciar Frontend (outro terminal)

```bash
cd client
npm start
```

✅ Frontend abrindo em: **http://localhost:3000**

## 5️⃣ Testar

1. Acesse `http://localhost:3000`
2. Navegue pelas páginas:
   - Dashboard → Veja ranking
   - Associados → Veja lista e grupos
   - Grupos → Veja grupos e links de convite
   - Jogos → Veja jogos, confirmações, times
   - Calendário → Veja jogos no calendário
   - Estatísticas → Veja rankings detalhados

## 🔗 Testar Convites

Use um dos links de convite do console:

```bash
curl http://localhost:3001/api/grupos/convite/SEU_LINK_AQUI
```

## 📊 Ver Dados no Banco

```bash
cd server/data
sqlite3 piloto-baba.db
.tables
SELECT * FROM associados;
SELECT * FROM grupos;
.quit
```

## 🧹 Limpar e Recriar

```bash
rm server/data/piloto-baba.db
cd server && npm run populate
```

---

**Dúvidas?** Veja `TESTE_APLICACAO.md` para guia completo!





