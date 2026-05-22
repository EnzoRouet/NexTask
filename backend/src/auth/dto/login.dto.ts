import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email("Format d'email invalide"),
  password: z.string(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
