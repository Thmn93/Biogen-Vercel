const { getDatabase } = require('../config/database');
const { lancamentoSchema } = require('../utils/validation');

class LancamentoController {
  // Listar lançamentos
  async list(req, res) {
    try {
      const db = getDatabase();
      let lancamentos = [];
      if (req.user.role === 'admin') {
        const userId = req.query.userId;
        if (userId) {
          lancamentos = db.prepare('SELECT * FROM lancamentos WHERE userId = ? ORDER BY ano DESC, mes DESC').all(userId);
        } else {
          lancamentos = db.prepare('SELECT * FROM lancamentos ORDER BY ano DESC, mes DESC').all();
        }
      } else if (req.user.role === 'fornecedor') {
        lancamentos = db.prepare('SELECT * FROM lancamentos WHERE userId = ? ORDER BY ano DESC, mes DESC').all(req.user.id);
      } else {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      res.json(lancamentos);
    } catch (error) {
      console.error('Erro ao listar lançamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo lançamento
  async create(req, res) {
    try {
      console.log('REQ.BODY:', req.body);
      // Validar diretamente o req.body
      const { error, value } = lancamentoSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details.map(d => d.message) 
        });
      }
      const db = getDatabase();
      const existente = db.prepare('SELECT id FROM lancamentos WHERE userId = ? AND ano = ? AND mes = ?').get(req.user.id, value.ano, value.mes);
      if (existente) {
        return res.status(409).json({ error: 'Já existe lançamento para este mês/ano.' });
      }
      const result = db.prepare(`
        INSERT INTO lancamentos (
          userId, ano, mes, toneladasProcessadas, energiaGerada, impostoAbatido
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, value.ano, value.mes, value.toneladasProcessadas, value.energiaGerada, value.impostoAbatido);
      res.status(201).json({
        message: 'Lançamento criado com sucesso',
        lancamentoId: result.lastInsertRowid
      });
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar lançamento
  async update(req, res) {
    try {
      const { id } = req.params;
      // Validar diretamente o req.body
      const { error, value } = lancamentoSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.details.map(d => d.message) 
        });
      }
      const db = getDatabase();
      // Verifica se já existe outro lançamento para o mesmo mês/ano/usuário
      const lancamentoAtual = db.prepare('SELECT * FROM lancamentos WHERE id = ?').get(id);
if (!lancamentoAtual) {
  return res.status(404).json({ error: 'Lançamento não encontrado' });
}

if (req.user.role !== 'admin' && lancamentoAtual.userId !== req.user.id) {
  return res.status(403).json({ error: 'Acesso negado' });
}

  // Só verifica duplicidade se mudou ano/mes
  const anoAlterado = value.ano !== lancamentoAtual.ano;
  const mesAlterado = value.mes !== lancamentoAtual.mes;

  if (anoAlterado || mesAlterado) {
    const existente = db.prepare(
      'SELECT id FROM lancamentos WHERE userId = ? AND ano = ? AND mes = ? AND id != ?'
    ).get(req.user.id, value.ano, value.mes, id);

    if (existente) {
      return res.status(409).json({ error: 'Já existe lançamento para este mês/ano.' });
    }
  }
      const lancamento = db.prepare('SELECT * FROM lancamentos WHERE id = ?').get(id);
      if (!lancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }
      if (req.user.role !== 'admin' && lancamento.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      db.prepare(`
        UPDATE lancamentos 
        SET ano = ?, mes = ?, toneladasProcessadas = ?, energiaGerada = ?, impostoAbatido = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(value.ano, value.mes, value.toneladasProcessadas, value.energiaGerada, value.impostoAbatido, id);
      res.json({ message: 'Lançamento atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar lançamento
  async delete(req, res) {
  try {
    const { id } = req.params;
    console.log('ID recebido para deletar:', id);

    const db = getDatabase();
    const lancamento = db.prepare('SELECT * FROM lancamentos WHERE id = ?').get(id);
    console.log('Lançamento encontrado:', lancamento);
    console.log('Usuário autenticado:', req.user);

    if (!lancamento) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }

    const lancamentoUserId = lancamento.userId || lancamento.user_id;

    if (req.user.role !== 'admin' && lancamentoUserId !== req.user.id) {
      console.warn(`Usuário ${req.user.id} tentou excluir lançamento de ${lancamentoUserId}`);
      return res.status(403).json({ error: 'Acesso negado' });
    }

    db.prepare('DELETE FROM lancamentos WHERE id = ?').run(id);
    res.json({ message: 'Lançamento deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

}

module.exports = new LancamentoController(); 