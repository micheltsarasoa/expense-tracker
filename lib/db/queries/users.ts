import { query } from '../client';

export async function createUser(email: string, passwordHash: string, name: string) {
  const sql = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
  `;
  
  const result = await query(sql, [email, passwordHash, name]);
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const sql = `SELECT * FROM users WHERE email = $1`;
  const result = await query(sql, [email]);
  return result.rows[0];
}

export async function getUserById(id: string) {
  const sql = `SELECT id, email, name, created_at FROM users WHERE id = $1`;
  const result = await query(sql, [id]);
  return result.rows[0];
}