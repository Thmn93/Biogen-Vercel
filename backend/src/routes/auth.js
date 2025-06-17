/**
 * Rotas de autenticação
 * Cadastro de usuários e login
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');
const { fornecedorSchema, beneficiarioSchema, loginSchema } = require('../utils/validation');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login de usuário (admin ou fornecedor)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auth'
 *           example:
 *             email: admin@biogen.com
 *             password: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @swagger
 * /api/auth/register/fornecedor:
 *   post:
 *     summary: Cadastro de fornecedor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cnpj:
 *                 type: string
 *               razaoSocial:
 *                 type: string
 *               cep:
 *                 type: string
 *               endereco:
 *                 type: string
 *               numero:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *           example:
 *             cnpj: "12.345.678/0001-90"
 *             razaoSocial: "Empresa Exemplo"
 *             cep: "12345-678"
 *             endereco: "Rua Exemplo"
 *             numero: "123"
 *             email: "fornecedor@biogen.com"
 *             senha: "senha123"
 *     responses:
 *       201:
 *         description: Fornecedor cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */

/**
 * @swagger
 * /api/auth/register/beneficiario:
 *   post:
 *     summary: Cadastro de beneficiário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nis:
 *                 type: string
 *               email:
 *                 type: string
 *           example:
 *             nis: "12345678901"
 *             email: "beneficiario@biogen.com"
 *     responses:
 *       201:
 *         description: Beneficiário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */

/**
 * @swagger
 * /api/auth/reset-password/{id}:
 *   put:
 *     summary: Redefinir senha de usuário
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               novaSenha:
 *                 type: string
 *           example:
 *             novaSenha: "novasenha123"
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */

// Rotas de autenticação
router.post('/register/fornecedor', authController.registerFornecedor);
router.post('/register/beneficiario', authController.registerBeneficiario);
router.post('/login', authController.login);
router.put('/reset-password/:id', authController.resetPassword);

// Cadastro de fornecedor
router.post('/register/fornecedor', async (req, res) => {
  try {
    // Validar dados
    const { error, value } = fornecedorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(d => d.message) 
      });
    }

    const { cnpj, razaoSocial, cep, endereco, numero, email, senha } = value;
    const db = getDatabase();

    // Verificar se email já existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir fornecedor
    const result = db.prepare(`
      INSERT INTO users (email, password, role, cnpj, razaoSocial, cep, endereco, numero)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, 'fornecedor', cnpj, razaoSocial, cep, endereco, numero);

    res.status(201).json({ 
      message: 'Fornecedor cadastrado com sucesso',
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Erro no cadastro de fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cadastro de beneficiário
router.post('/register/beneficiario', async (req, res) => {
  try {
    // Validar dados
    const { error, value } = beneficiarioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(d => d.message) 
      });
    }

    const { nis, email } = value;
    const db = getDatabase();

    // Verificar se email já existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Inserir beneficiário (sem senha - acesso por NIS)
    const result = db.prepare(`
      INSERT INTO users (email, password, role, nis)
      VALUES (?, ?, ?, ?)
    `).run(email, '', 'beneficiario', nis);

    res.status(201).json({ 
      message: 'Beneficiário cadastrado com sucesso',
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Erro no cadastro de beneficiário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login unificado
router.post('/login', async (req, res) => {
  try {
    // Validar dados
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.details.map(d => d.message) 
      });
    }

    const { email, password } = value;
    const db = getDatabase();

    // Buscar usuário
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se é beneficiário (não tem login por senha)
    if (user.role === 'beneficiario') {
      return res.status(401).json({ error: 'Beneficiários não fazem login por senha' });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Resposta sem senha
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para redefinir a senha de um usuário
router.put('/reset-password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) {
      return res.status(400).json({ error: 'A nova senha é obrigatória' });
    }

    const db = getDatabase();

    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar a senha no banco de dados
    const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Senha atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDatabase();

    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, 'user');

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
