require('dotenv').config();
const { runMigrations } = require('../config/migrations');

async function migrate() {
  try {
    console.log('🔄 Iniciando migrações...');
    await runMigrations();
    console.log('✅ Migrações concluídas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

migrate(); 