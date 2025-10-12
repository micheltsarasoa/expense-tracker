import { query } from '../client';

export async function createCategory(data: {
  userId: string;
  name: string;
  type: string;
  parentId?: string;
  icon?: string;
  color?: string;
}) {
  const sql = `
    INSERT INTO categories (user_id, name, type, parent_id, icon, color)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await query(sql, [
    data.userId,
    data.name,
    data.type,
    data.parentId || null,
    data.icon || '📁',
    data.color || '#6B7280',
  ]);
  return result.rows[0];
}

export async function getCategoriesByUser(userId: string) {
  const sql = `
    SELECT * FROM categories 
    WHERE user_id = $1
    ORDER BY parent_id NULLS FIRST, name ASC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}