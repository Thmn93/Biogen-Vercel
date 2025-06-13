require('dotenv').config();
const { rollbackLastMigration } = require('../config/migrations');

async function rollback() {
  try {
    console.log('🔄 Iniciando rollback da última migração...');
    await rollbackLastMigration();
    console.log('✅ Rollback concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar rollback:', error);
    process.exit(1);
  }
}

rollback(); 