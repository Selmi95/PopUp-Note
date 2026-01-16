const { pool } = require('../db');

const User = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ email, password, role = 'user', encryptionKey }) {
    const result = await pool.query(
      'INSERT INTO users (email, password, role, encryption_key) VALUES ($1, $2, $3, $4) RETURNING *',
      [email.toLowerCase(), password, role, encryptionKey]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
};

module.exports = User;
