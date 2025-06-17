const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./database');

// Ordem das migrações
const MIGRATION_ORDER = [
  'create_users_table',
  'create_lancamentos_table'
];

// Função para executar todas as migrações
async function runMigrations() {
  const db = getDatabase();
  
  try {
    // Criar tabela de migrações se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Executar migrações na ordem definida
    for (const migrationName of MIGRATION_ORDER) {
      // Verificar se a migração já foi executada
      const executed = db.prepare('SELECT id FROM migrations WHERE name = ?').get(migrationName);
      
      if (!executed) {
        console.log(`Executando migração: ${migrationName}`);
        
        // Importar e executar a migração
        const migration = require(path.join(__dirname, '../migrations', `${migrationName}.js`));
        await migration.up();
        
        // Registrar a migração como executada
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
        
        console.log(`✅ Migração ${migrationName} executada com sucesso`);
      }
    }

    console.log('✅ Todas as migrações foram executadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Função para reverter a última migração
async function rollbackLastMigration() {
  const db = getDatabase();
  
  try {
    // Buscar a última migração executada
    const lastMigration = db.prepare('SELECT name FROM migrations ORDER BY id DESC LIMIT 1').get();
    
    if (!lastMigration) {
      console.log('Nenhuma migração para reverter');
      return;
    }

    console.log(`Revertendo migração: ${lastMigration.name}`);
    
    // Importar e executar o rollback da migração
    const migration = require(path.join(__dirname, '../migrations', `${lastMigration.name}.js`));
    await migration.down();
    
    // Remover a migração da tabela de migrações
    db.prepare('DELETE FROM migrations WHERE name = ?').run(lastMigration.name);
    
    console.log(`✅ Migração ${lastMigration.name} revertida com sucesso`);
    
  } catch (error) {
    console.error('❌ Erro ao reverter migração:', error);
    throw error;
  }
}

module.exports = { runMigrations, rollbackLastMigration }; 