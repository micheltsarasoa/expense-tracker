import { query } from '../client';

export async function createTransaction(data: {
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  transactionDate: Date;
  categoryId?: string;
  paymentMethodId: string;
  toPaymentMethodId?: string;
}) {
  const sql = `
    INSERT INTO transactions (
      user_id, type, amount, description, transaction_date,
      category_id, payment_method_id, to_payment_method_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await query(sql, [
    data.userId,
    data.type,
    data.amount,
    data.description,
    data.transactionDate,
    data.categoryId,
    data.paymentMethodId,
    data.toPaymentMethodId,
  ]);
  return result.rows[0];
}

export async function getTransactionsByUser(userId: string, limit = 20, offset = 0) {
  const sql = `
    SELECT t.*, 
           c.name as category_name, 
           c.icon as category_icon,
           pm.name as payment_method_name,
           pm.icon as payment_method_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
    WHERE t.user_id = $1 AND t.is_deleted = FALSE
    ORDER BY t.transaction_date DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await query(sql, [userId, limit, offset]);
  return result.rows;
}

export async function updateTransaction2(id: string, userId: string, data: any) {
  const sql = `
    UPDATE transactions
    SET amount = $1, description = $2, transaction_date = $3,
        category_id = $4, payment_method_id = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND user_id = $7
    RETURNING *
  `;
  const result = await query(sql, [
    data.amount,
    data.description,
    data.transactionDate,
    data.categoryId,
    data.paymentMethodId,
    id,
    userId,
  ]);
  return result.rows[0];
}

export async function updateTransaction(id: string, userId: string, data: any) {
  // Build dynamic update
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.amount !== undefined) {
    updates.push(`amount = $${paramCount++}`);
    values.push(data.amount);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.transactionDate !== undefined) {
    updates.push(`transaction_date = $${paramCount++}`);
    values.push(data.transactionDate);
  }
  if (data.categoryId !== undefined) {
    updates.push(`category_id = $${paramCount++}`);
    values.push(data.categoryId);
  }
  if (data.paymentMethodId !== undefined) {
    updates.push(`payment_method_id = $${paramCount++}`);
    values.push(data.paymentMethodId);
  }
  if (data.accountId !== undefined) {
    updates.push(`account_id = $${paramCount++}`);
    values.push(data.accountId);
  }
  if (data.toAccountId !== undefined) {
    updates.push(`to_payment_method_id = $${paramCount++}`);
    values.push(data.toAccountId);
  }
  if (data.type !== undefined) {
    updates.push(`type = $${paramCount++}`);
    values.push(data.type);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, userId);

  const sql = `
    UPDATE transactions
    SET ${updates.join(', ')}
    WHERE id = $${paramCount++} AND user_id = $${paramCount++} AND is_deleted = FALSE
    RETURNING *
  `;
  console.log('id: ' + id);
  console.log(sql);

  const result = await query(sql, values);
  return result.rows[0];
}

export async function deleteTransaction(id: string, userId: string) {
  const sql = `
    UPDATE transactions
    SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await query(sql, [id, userId]);
  return result.rows[0];
}

export async function getTransactionsCount(userId: string) {
  const sql = `
    SELECT COUNT(*) as total
    FROM transactions
    WHERE user_id = $1 AND is_deleted = FALSE
  `;
  const result = await query(sql, [userId]);
  return parseInt(result.rows[0].total);
}