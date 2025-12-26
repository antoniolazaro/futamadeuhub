# PeladaHub 🏆

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

## ⚽ Sobre o Projeto

**PeladaHub** é uma plataforma completa e moderna para gestão de jogos de futebol amador. Desenvolvida com as melhores práticas de UX/UI, oferece uma experiência profissional para organizar peladas, acompanhar estatísticas e gerenciar grupos de jogadores.

> 🚀 **[Acesse a aplicação](https://peladahub.vercel.app)**

### 🎯 Funcionalidades Principais

- 👥 **Gestão de Associados**: Cadastro, edição e importação via Excel/CSV
- ⚽ **Organização de Grupos**: Times, responsáveis e membros
- 📊 **Estatísticas Avançadas**: Rankings, aproveitamento e métricas detalhadas
- 📅 **Calendário Interativo**: Visualização de jogos com súmulas por dia
- 📋 **Súmulas Digitais**: Registro completo de confrontos e cartões
- 🎯 **Sistema de Pontuação**: Regras claras e justas

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** com TypeScript
- **Tailwind CSS** para estilização moderna
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Date-fns** para manipulação de datas

### **Backend**
- **Node.js** com Express
- **TypeScript** para tipagem forte
- **SQLite** como banco de dados
- **Multer** para upload de arquivos
- **XLSX** para processamento de planilhas

### **Deploy**
- **Vercel** para hospedagem
- **GitHub** para versionamento

## 📦 Instalação e Execução

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/SEU_USERNAME/peladahub.git
cd peladahub

# Instale todas as dependências
npm run install:all
```

### **Execução em Desenvolvimento**
```bash
# Executa frontend e backend simultaneamente
npm run dev
```

### **Build para Produção**
```bash
# Build do projeto completo
npm run vercel-build
```

## 🚀 Deploy na Vercel

### **Passo 1: Crie o Repositório no GitHub**
1. Acesse [GitHub.com](https://github.com)
2. Clique em **"New repository"**
3. Nomeie como `peladahub`
4. **Não** marque "Add a README file"
5. Clique em **"Create repository"**

### **Passo 2: Faça o Push do Código**
```bash
# Adicione o repositório remoto
git remote add origin https://github.com/SEU_USERNAME/peladahub.git

# Adicione os arquivos
git add .

# Commit inicial
git commit -m "Initial commit: PeladaHub - Plataforma de gestão de futebol amador"

# Push para GitHub
git push -u origin main
```

### **Passo 3: Deploy na Vercel**
1. Acesse [Vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe seu repositório GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
5. Clique em **"Deploy"**

### **Passo 4: Configure o Banco de Dados**
Como estamos usando SQLite, você pode:
1. **Usar um arquivo local** (dados não persistem entre deploys)
2. **Migrar para PostgreSQL** (recomendado para produção)
3. **Usar Vercel Postgres** (serviço pago da Vercel)

## 📁 Estrutura do Projeto

```
peladahub/
├── 📁 client/                 # Frontend React
│   ├── 📁 public/            # Assets estáticos
│   ├── 📁 src/
│   │   ├── 📁 pages/         # Páginas da aplicação
│   │   ├── 📁 services/      # Serviços de API
│   │   ├── 📁 types/         # Tipos TypeScript
│   │   └── 📄 App.tsx        # Componente principal
│   └── 📄 package.json
├── 📁 server/                 # Backend Node.js
│   ├── 📁 src/
│   │   ├── 📁 database/      # Configuração SQLite
│   │   ├── 📁 models/        # Modelos de dados
│   │   ├── 📁 routes/        # Endpoints da API
│   │   ├── 📁 services/      # Lógica de negócio
│   │   └── 📄 index.ts       # Servidor Express
│   └── 📄 package.json
├── 📄 vercel.json            # Configuração Vercel
├── 📄 .gitignore             # Arquivos ignorados
└── 📄 README.md
```

## 🎮 Como Usar

1. **📝 Cadastre os associados** na página "Associados"
2. **👥 Crie grupos** na página "Grupos" e defina responsáveis
3. **⚽ Organize jogos** na página "Jogos"
4. **📅 Acompanhe no calendário** e clique nos dias para ver súmulas
5. **📊 Visualize estatísticas** e rankings

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

---

<div align="center">

**PeladaHub** - Transformando a gestão de jogos de futebol amador! ⚽✨

⭐ **Deixe uma estrela se gostou do projeto!**

[📱 Acesse agora](https://peladahub.vercel.app) • [🐛 Reportar Bug](https://github.com/SEU_USERNAME/peladahub/issues) • [💡 Sugerir Feature](https://github.com/SEU_USERNAME/peladahub/discussions)

</div>

