import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  amount: z.number().positive('Amount must be positive'),
  period_type: z.enum(['one_time', 'monthly', 'weekly', 'yearly']),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  end_date: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  period_type: z.enum(['one_time', 'monthly', 'weekly', 'yearly']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
});