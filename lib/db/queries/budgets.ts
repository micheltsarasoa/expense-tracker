import { query } from '../client';

export async function createBudget(data: {
  userId: string;
  name: string;
  amount: number;
  periodType: 'one_time' | 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  const sql = `
    INSERT INTO budgets (user_id, name, amount, period_type, start_date, end_date, category_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await query(sql, [
    data.userId,
    data.name,
    data.amount,
    data.periodType,
    data.startDate,
    data.endDate || null,
    data.categoryId || null,
  ]);
  return result.rows[0];
}

export async function getBudgetsByUser(userId: string) {
  const sql = `
    SELECT b.*, c.name as category_name, c.icon as category_icon,
           COALESCE(
             (SELECT SUM(t.amount) 
              FROM transactions t 
              WHERE t.user_id = b.user_id 
                AND t.type = 'expense'
                AND t.is_deleted = FALSE
                AND t.transaction_date >= b.start_date
                AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
                AND (b.category_id IS NULL OR t.category_id = b.category_id)
             ), 0
           ) as spent_amount
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = $1 AND b.is_active = TRUE
    ORDER BY b.created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}

export async function getBudgetById(id: string, userId: string) {
  const sql = `
    SELECT b.*, 
           c.name as category_name, 
           c.icon as category_icon,
           COALESCE(
             (SELECT SUM(t.amount) 
              FROM transactions t 
              WHERE t.user_id = b.user_id 
                AND t.type = 'expense'
                AND t.is_deleted = FALSE
                AND t.transaction_date >= b.start_date
                AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
                AND (b.category_id IS NULL OR t.category_id = b.category_id)
             ), 0
           ) as spent_amount
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = $1 AND b.user_id = $2
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0];
}

export async function updateBudget(id: string, userId: string, data: any) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.amount !== undefined) {
    updates.push(`amount = $${paramCount++}`);
    values.push(data.amount);
  }
  if (data.periodType !== undefined) {
    updates.push(`period_type = $${paramCount++}`);
    values.push(data.periodType);
  }
  if (data.startDate !== undefined) {
    updates.push(`start_date = $${paramCount++}`);
    values.push(data.startDate);
  }
  if (data.endDate !== undefined) {
    updates.push(`end_date = $${paramCount++}`);
    values.push(data.endDate);
  }
  if (data.categoryId !== undefined) {
    updates.push(`category_id = $${paramCount++}`);
    values.push(data.categoryId);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(data.isActive);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, userId);

  const sql = `
    UPDATE budgets
    SET ${updates.join(', ')}
    WHERE id = $${paramCount++} AND user_id = $${paramCount++}
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0];
}

export async function deleteBudget(id: string, userId: string) {
  const sql = `
    UPDATE budgets
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0];
}