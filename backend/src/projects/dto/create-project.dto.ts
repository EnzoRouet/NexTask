import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(3, 'Le titre du projet est trop court'),
  description: z
    .string()
    .min(5, 'La description est trop courte')
    .or(z.literal(''))
    .optional(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
