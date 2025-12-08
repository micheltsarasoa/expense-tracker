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


type TransactionFilters = {
  type?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export async function getTransactionsByUser(
  userId: string,
  limit = 20,
  offset = 0,
  filters?: TransactionFilters
) {
  const params: any[] = [userId];
  let paramIndex = 2;
  const conditions: string[] = ['t.user_id = $1', 't.is_deleted = FALSE'];

  // Type filter
  if (filters?.type) {
    conditions.push(`t.type = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  // Category filter
  if (filters?.categoryId) {
    conditions.push(`t.category_id = $${paramIndex}`);
    params.push(filters.categoryId);
    paramIndex++;
  }

  // Date from filter
  if (filters?.dateFrom) {
    conditions.push(`t.transaction_date >= $${paramIndex}`);
    params.push(filters.dateFrom);
    paramIndex++;
  }

  // Date to filter
  if (filters?.dateTo) {
    conditions.push(`t.transaction_date <= $${paramIndex}`);
    params.push(filters.dateTo);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const sql = `
    SELECT t.id,
           t.type,
           t.amount,
           t.description,
           t.transaction_date,
           t.category_id,
           c.name as category_name, 
           c.icon as category_icon,
           pm.name as payment_method_name,
           pm.icon as payment_method_icon,
           pm.id as payment_method_id,
           tpm.name as to_payment_method_name,
           tpm.icon as to_payment_method_icon,
           tpm.id as to_payment_method_id
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
    LEFT JOIN payment_methods tpm ON t.to_payment_method_id = tpm.id
    WHERE ${whereClause}
    ORDER BY t.transaction_date DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  console.log(sql); //debugg
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

export async function getTransactionsByUser_old(userId: string, limit = 20, offset = 0) {
  const sql = `
    SELECT t.id,
           t.type,
           t.amount,
           t.description,
           t.transaction_date,
           t.category_id,
           c.name as category_name, 
           c.icon as category_icon,
           pm.name as payment_method_name,
           pm.icon as payment_method_icon,
           pm.id as payment_method_id,
           tpm.name as to_payment_method_name,
           tpm.icon as to_payment_method_icon,
           tpm.id as to_payment_method_id
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
    LEFT JOIN payment_methods tpm ON t.to_payment_method_id = tpm.id
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
        category_id = $4, payment_method_id = $5, updated_at = CURRENT_TIMESTAMP, to_payment_method_id = $6
    WHERE id = $7 AND user_id = $8
    RETURNING *
  `;
  const result = await query(sql, [
    data.amount,
    data.description,
    data.transactionDate,
    data.categoryId,
    data.paymentMethodId,
    data.toPaymentMethodId,
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
  if (data.toPaymentMethodId !== undefined) {
    updates.push(`to_payment_method_id = $${paramCount++}`);
    values.push(data.toPaymentMethodId);
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

export async function getTransactionsCount_old(userId: string) {
  const sql = `
    SELECT COUNT(*) as total
    FROM transactions
    WHERE user_id = $1 AND is_deleted = FALSE
  `;
  const result = await query(sql, [userId]);
  return parseInt(result.rows[0].total);
}

// Get total count with filters (for pagination)
export async function getTransactionsCount(
  userId: string,
  filters?: TransactionFilters
) {
  const params: any[] = [userId];
  let paramIndex = 2;
  const conditions: string[] = ['user_id = $1', 'is_deleted = FALSE'];

  if (filters?.type) {
    conditions.push(`type = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  if (filters?.categoryId) {
    conditions.push(`category_id = $${paramIndex}`);
    params.push(filters.categoryId);
    paramIndex++;
  }

  if (filters?.dateFrom) {
    conditions.push(`transaction_date >= $${paramIndex}`);
    params.push(filters.dateFrom);
    paramIndex++;
  }

  if (filters?.dateTo) {
    conditions.push(`transaction_date <= $${paramIndex}`);
    params.push(filters.dateTo);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const sql = `
    SELECT COUNT(*) as total
    FROM transactions
    WHERE ${whereClause}
  `;

  const result = await query(sql, params);
  return parseInt(result.rows[0].total);
}