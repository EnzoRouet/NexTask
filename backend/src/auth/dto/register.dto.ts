import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email("Format d'email invalide"),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(2, 'Le nom est trop court'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
