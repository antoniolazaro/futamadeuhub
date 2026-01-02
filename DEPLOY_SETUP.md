# 🚀 Deploy e Configuração do Banco - PeladaHub

## Populando o Banco na Vercel

### Opção 1: Via API Endpoint (Recomendado)

Após fazer deploy na Vercel, execute:

```bash
# Substitua SEU_DOMINIO pelo domínio da sua aplicação na Vercel
curl -X POST https://SEU_DOMINIO.vercel.app/api/admin/populate
```

**Exemplo:**
```bash
curl -X POST https://peladahub.vercel.app/api/admin/populate
```

### Opção 2: Script Local para Deploy

1. **Build local primeiro:**
```bash
npm run deploy:populate
```

2. **Deploy na Vercel** (o banco será populado automaticamente)

### Opção 3: Setup Manual

```bash
# Executar setup do banco
npm run setup-db
```

## Verificando se Funcionou

Após popular o banco, teste:

```bash
# Health check
curl https://SEU_DOMINIO.vercel.app/api/health

# Verificar associados
curl https://SEU_DOMINIO.vercel.app/api/associados

# Verificar grupos
curl https://SEU_DOMINIO.vercel.app/api/grupos
```

## Problema: SQLite na Vercel

⚠️ **Importante:** A Vercel não mantém arquivos SQLite entre deploys. Isso significa:

- ✅ Banco é criado novo a cada deploy
- ❌ Dados não persistem entre deploys
- ❌ Uploads de arquivos não funcionam bem

## Soluções para Produção

### 1. Migrar para PostgreSQL (Recomendado)

```bash
# Instalar dependências PostgreSQL
npm install pg @types/pg
```

### 2. Usar Vercel Postgres

1. Ativar Vercel Postgres no dashboard
2. Configurar variáveis de ambiente:
   - `DATABASE_URL` - URL do banco PostgreSQL

### 3. Usar PlanetScale ou Supabase

1. Criar conta no PlanetScale/Supabase
2. Configurar conexão externa
3. Atualizar `src/database/db.ts` para usar PostgreSQL

## Scripts Disponíveis

```bash
# Desenvolvimento local
npm run populate          # Popular banco local
npm run dev               # Iniciar dev servers

# Produção/Build
npm run vercel-build      # Build para Vercel
npm run setup-db          # Setup do banco
npm run deploy:populate   # Build + populate

# API Endpoints
POST /api/admin/populate  # Popular via API (produção)
GET /api/health          # Health check
```

## Estrutura de Arquivos

```
├── deploy-setup.js        # Script de setup do banco
├── vercel.json           # Configuração Vercel
├── server/
│   ├── src/
│   │   ├── scripts/
│   │   │   └── populateFakeData.ts  # Script de população
│   │   └── index.ts                 # API + endpoint /admin/populate
│   └── data/
│       └── piloto-baba.db           # Banco SQLite (local)
└── client/
    └── build/                      # Build do frontend
```

## Troubleshooting

### Erro: "Cannot find module"
```bash
# Build do server primeiro
npm run build:server
```

### Erro: "Database locked"
```bash
# Na Vercel, isso é normal. Execute novamente.
curl -X POST https://SEU_DOMINIO.vercel.app/api/admin/populate
```

### Dados não aparecem
```bash
# Verificar logs da Vercel
# Ou testar localmente primeiro
npm run populate
npm run dev
```

---

**🎯 Resumo:** Use `curl -X POST https://SEU_DOMINIO.vercel.app/api/admin/populate` após o deploy!
