const { pool } = require('../db');

const Note = {
  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ userId, title, content }) {
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );
    return result.rows[0];
  },

  async update(id, { title, content }) {
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  },

  async countByUserId(userId) {
    const result = await pool.query('SELECT COUNT(*) FROM notes WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0].count);
  },

  async deleteByUserId(userId) {
    await pool.query('DELETE FROM notes WHERE user_id = $1', [userId]);
  }
};

module.exports = Note;
