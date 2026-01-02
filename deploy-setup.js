#!/usr/bin/env node

/**
 * Script para configurar/popular o banco de dados após deploy
 * Pode ser executado manualmente ou integrado ao processo de deploy
 */

const { exec } = require('child_process');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...');

  return new Promise((resolve, reject) => {
    const populateScript = path.join(__dirname, 'server', 'dist', 'scripts', 'populateFakeData.js');

    // Executar o script de população
    exec(`node -e "require('${populateScript}').popularDadosFake().then(() => console.log('✅ Banco populado com sucesso!')).catch(console.error)"`,
      { cwd: __dirname },
      (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro ao popular banco:', error);
          reject(error);
          return;
        }

        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('🎉 Configuração do banco concluída!');
        resolve();
      }
    );
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no setup:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
