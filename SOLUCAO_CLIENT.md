# Solução para Problemas no Cliente

## 🔧 Passo a Passo para Resolver

### 1. Verificar Dependências

```bash
cd client
npm install
```

Se der erro, tente:
```bash
npm install --legacy-peer-deps
```

### 2. Limpar Cache e Reinstalar

```bash
cd client
rm -rf node_modules package-lock.json .cache build
npm install
```

### 3. Verificar Versão do Node

```bash
node --version
# Deve ser v16 ou superior
```

Se não tiver Node.js instalado ou versão antiga:
- Instale Node.js v18 ou superior de https://nodejs.org

### 4. Verificar Porta

Se a porta 3000 estiver em uso:

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Ou use outra porta:
```bash
PORT=3001 npm start
```

### 5. Iniciar o Cliente

```bash
cd client
npm start
```

## 🐛 Erros Específicos

### Erro: "Module not found"
```bash
cd client
rm -rf node_modules
npm install
```

### Erro: Tailwind CSS
```bash
cd client
npm install -D tailwindcss@^3.4.1 postcss@^8.5.6 autoprefixer@^10.4.22
```

### Erro: TypeScript
```bash
cd client
npm install --save-dev typescript@^4.9.5
```

### Erro: React Router
```bash
cd client
npm install react-router-dom@^6.0.0
```

## ✅ Verificar se Funcionou

1. O terminal deve mostrar:
   ```
   Compiled successfully!
   ```

2. O navegador deve abrir automaticamente em `http://localhost:3000`

3. Você deve ver a página inicial com o menu de navegação

## 📋 Checklist

- [ ] Node.js instalado (v16+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Porta 3000 livre
- [ ] Backend rodando na porta 3001
- [ ] Sem erros no console do terminal

## 🔍 Verificar Logs

Se ainda não funcionar, verifique:
1. Mensagens de erro no terminal
2. Console do navegador (F12)
3. Logs do npm

## 💡 Solução Rápida (Último Recurso)

```bash
cd client
rm -rf node_modules package-lock.json .cache build
npm cache clean --force
npm install
npm start
```





