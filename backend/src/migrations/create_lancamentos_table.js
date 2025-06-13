const { getDatabase } = require('../config/database');

function up() {
  const db = getDatabase();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      mes TEXT NOT NULL,
      toneladasProcessadas REAL NOT NULL,
      energiaGerada REAL NOT NULL,
      impostoAbatido REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
}

function down() {
  const db = getDatabase();
  db.exec('DROP TABLE IF EXISTS lancamentos');
}

module.exports = { up, down }; 