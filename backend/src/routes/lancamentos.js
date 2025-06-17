/**
 * Rotas para gerenciamento de lançamentos
 * CRUD para fornecedores e visualização para admins
 *
 * @swagger
 * /api/lancamentos:
 *   post:
 *     summary: Criar lançamento
 *     tags: [Lancamento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lancamento'
 *           example:
 *             ano: 2024
 *             mes: "Janeiro"
 *             toneladasProcessadas: 100
 *             energiaGerada: 200
 *             impostoAbatido: 50
 *     responses:
 *       201:
 *         description: Lançamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *
 *   get:
 *     summary: Listar lançamentos
 *     tags: [Lancamento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de lançamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lancamento'
 *
 * /api/lancamentos/{id}:
 *   put:
 *     summary: Editar lançamento
 *     tags: [Lancamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do lançamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lancamento'
 *     responses:
 *       200:
 *         description: Lançamento atualizado com sucesso
 *       404:
 *         description: Lançamento não encontrado
 *
 *   delete:
 *     summary: Excluir lançamento
 *     tags: [Lancamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do lançamento
 *     responses:
 *       200:
 *         description: Lançamento excluído com sucesso
 *       404:
 *         description: Lançamento não encontrado
 */

const express = require('express');
const lancamentoController = require('../controllers/lancamentoController');
const { authenticateToken, requireAdminOrFornecedor } = require('../middleware/auth');
const router = express.Router();

// Rotas de lançamentos (protegidas por autenticação)
router.use(authenticateToken);
router.use(requireAdminOrFornecedor);

router.post('/', lancamentoController.create);
router.get('/', lancamentoController.list);
router.put('/:id', lancamentoController.update);
router.delete('/:id', lancamentoController.delete);

module.exports = router;
