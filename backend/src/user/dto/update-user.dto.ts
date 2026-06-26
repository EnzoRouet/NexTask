import { z } from 'zod';

export const UpdateUserSchema = z.object({
  email: z.email({ message: 'Adresse email invalide.' }).trim().optional(),
  name: z
    .string()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
    .trim()
    .optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
