import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  transaction_date: z.string().datetime(),
  category_id: z.string().optional(),
  payment_method_id: z.string(),
  to_payment_method_id: z.string().optional(),
}).refine((data) => {
  // Transfer must have to_payment_method_id
  if (data.type === "transfer" && !data.to_payment_method_id) {
    return false;
  }
  // Income/Expense must have category_id
  if (data.type !== "transfer" && !data.category_id) {
    return false;
  }
  return true;
}, {
  message: "Invalid transaction data",
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  transaction_date: z.string().optional(),
  category_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  to_payment_method_id: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;