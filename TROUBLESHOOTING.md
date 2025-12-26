# Troubleshooting - Cliente (Frontend)

## Problemas Comuns e Soluções

### 1. Erro ao iniciar (`npm start`)

#### Erro: "Cannot find module" ou dependências faltando
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Erro: "Port 3000 is already in use"
```bash
# Opção 1: Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Opção 2: Usar outra porta
PORT=3001 npm start
```

#### Erro: Tailwind CSS não funciona
```bash
cd client
npm install -D tailwindcss@^3.4.1 postcss@^8.5.6 autoprefixer@^10.4.22
npm start
```

### 2. Erro de Compilação TypeScript

#### Limpar cache e recompilar
```bash
cd client
rm -rf node_modules .cache build
npm install
npm start
```

### 3. Erro de Módulos

#### Verificar se todas as dependências estão instaladas
```bash
cd client
npm install --legacy-peer-deps
```

### 4. Erro de PostCSS/Tailwind

Se o erro persistir, verifique:
1. `postcss.config.js` existe e está correto
2. `tailwind.config.js` existe e está correto
3. `src/index.css` tem as diretivas do Tailwind

### 5. Limpar tudo e recomeçar

```bash
cd client
rm -rf node_modules package-lock.json .cache build
npm install
npm start
```

## Verificar se está funcionando

1. O servidor deve iniciar sem erros
2. O navegador deve abrir automaticamente em `http://localhost:3000`
3. Você deve ver a página inicial do sistema

## Se nada funcionar

1. Verifique a versão do Node.js:
```bash
node --version  # Deve ser v16 ou superior
```

2. Verifique se o backend está rodando:
```bash
curl http://localhost:3001/api/health
```

3. Verifique os logs do console para erros específicos





