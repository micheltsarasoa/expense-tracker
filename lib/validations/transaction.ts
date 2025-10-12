import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  transaction_date: z.string().datetime(),
  category_id: z.string().uuid().optional(),
  payment_method_id: z.string().uuid(),
  to_payment_method_id: z.string().uuid().optional(),
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

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;