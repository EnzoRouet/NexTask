import { z } from 'zod';

export const CreateColumnSchema = z.object({
  name: z.string().min(2, 'Le nom de la colonne est trop court'),
  isLocked: z.boolean().optional(),
});

export type CreateColumnDto = z.infer<typeof CreateColumnSchema>;
