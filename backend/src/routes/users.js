/**
 * Rotas para gerenciamento de usuários
 * CRUD completo para administradores
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários (apenas admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Busca um usuário por ID (apenas admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Edita um usuário (apenas admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Exclui um usuário (apenas admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

const express = require('express');
const bcrypt = require('bcrypt');
const { getDatabase } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const users = db.prepare(`
      SELECT id, email, role, cnpj, razaoSocial, cep, endereco, numero, nis, createdAt, updatedAt
      FROM users
      ORDER BY createdAt DESC
    `).all();
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Buscar usuário por ID (apenas admin)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT id, email, role, cnpj, razaoSocial, cep, endereco, numero, nis, createdAt, updatedAt
      FROM users WHERE id = ?
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Editar usuário (apenas admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const updateData = req.body;
    
    // Remover campos sensíveis da atualização direta
    delete updateData.id;
    delete updateData.password;
    delete updateData.createdAt;
    
    // Construir query de update dinamicamente
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    const result = db.prepare(`
      UPDATE users 
      SET ${setClause}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    // Não permitir excluir próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível excluir próprio usuário' });
    }
    
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

module.exports = router;
