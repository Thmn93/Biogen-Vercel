const { getDatabase } = require('../config/database');

function up() {
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'fornecedor', 'beneficiario')),
      cnpj TEXT,
      razaoSocial TEXT,
      cep TEXT,
      endereco TEXT,
      numero TEXT,
      nis TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function down() {
  const db = getDatabase();
  db.exec('DROP TABLE IF EXISTS users');
}

module.exports = { up, down }; 