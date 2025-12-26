# Servidor Backend - Piloto Baba

## Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor em modo desenvolvimento com hot-reload usando `tsx watch`.

### Produção (após build)
```bash
npm run build    # Compila TypeScript para JavaScript
npm run start:prod  # Executa o código compilado
```

### Desenvolvimento (sem watch)
```bash
npm start
```
Inicia o servidor usando `tsx` diretamente (sem watch).

### Popular Dados Fake
```bash
npm run populate
```
Popula o banco de dados com dados de teste.

## ⚠️ Importante

- Use `npm run dev` para desenvolvimento (com hot-reload)
- Use `npm start` se não quiser watch mode
- Use `npm run build && npm run start:prod` apenas para produção

## Porta

O servidor roda na porta **3001** por padrão.

## Banco de Dados

O banco SQLite é criado automaticamente em `data/piloto-baba.db` na primeira execução.





