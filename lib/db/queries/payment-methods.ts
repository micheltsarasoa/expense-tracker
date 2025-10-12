import { query } from '../client';

export async function createPaymentMethod(data: {
  userId: string;
  name: string;
  type: string;
  initialBalance: number;
  icon?: string;
  color?: string;
}) {
  const sql = `
    INSERT INTO payment_methods (user_id, name, type, initial_balance, current_balance, icon, color)
    VALUES ($1, $2, $3::payment_method_type, $4, $4, $5, $6)
    RETURNING *
  `;
  const result = await query(sql, [
    data.userId,
    data.name,
    data.type,
    data.initialBalance,
    data.icon || '💰',
    data.color || '#3B82F6',
  ]);
  return result.rows[0];
}

export async function getPaymentMethodsByUser(userId: string) {
  const sql = `
    SELECT * FROM payment_methods 
    WHERE user_id = $1 AND is_active = TRUE
    ORDER BY created_at ASC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}