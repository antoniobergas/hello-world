import { z } from 'zod';

export const PrioritySchema = z.enum(['low', 'medium', 'high']);

export const ItemCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').default(''),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be 50 characters or fewer')
    .default('general'),
  priority: PrioritySchema.default('medium'),
  completed: z.boolean().default(false),
  dueDate: z.date().optional(),
  tags: z.array(z.string().max(30)).max(10, 'At most 10 tags allowed').optional(),
});

export type ItemCreateInput = z.infer<typeof ItemCreateSchema>;

export function validateItemCreate(data: unknown):
  | {
      success: true;
      data: ItemCreateInput;
    }
  | {
      success: false;
      errors: string[];
    } {
  const result = ItemCreateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((i) => i.message);
  return { success: false, errors };
}
