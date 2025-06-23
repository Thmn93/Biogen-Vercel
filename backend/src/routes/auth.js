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
    const { error, value } = fornecedorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { cnpj, razaoSocial, cep, endereco, numero, email, senha } = value;
    const db = getDatabase();

    // Verificar se CNPJ já existe
    const existingCNPJ = db.prepare('SELECT id FROM users WHERE cnpj = ?').get(cnpj);
    if (existingCNPJ) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    // Verificar se email já existe
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

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
    const { error, value } = beneficiarioSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { nis, email } = value;
    const db = getDatabase();

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

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

// Login atualizado
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password } = value;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não cadastrado',
        redirect: '/Projeto-BioGen-main/src/app/pages/login.component.html'  // cliente pode usar isso para redirecionar
      });
    }

    if (user.role === 'beneficiario') {
      return res.status(401).json({ error: 'Beneficiários não fazem login por senha' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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

module.exports = router;
