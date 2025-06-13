/**
 * Servidor principal do backend Biogen
 * Configuração do Express, middlewares e rotas
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDatabase, closeDatabase } = require('./config/database');
const { runMigrations } = require('./config/migrations');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');

// Importar rotas
const authRoutes = require('./routes/auth');
const lancamentosRoutes = require('./routes/lancamentos');
const usersRoutes = require('./routes/users');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/lancamentos', lancamentosRoutes);
app.use('/api/users', usersRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Executar migrações
    await runMigrations();
    
    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Gerenciar encerramento do servidor
process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  closeDatabase();
  process.exit(0);
});

startServer();
