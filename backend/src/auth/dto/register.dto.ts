import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email("Format d'email invalide"),
  password: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(
      /[A-Z]/,
      'Le mot de passe doit contenir au moins une lettre majuscule',
    )
    .regex(
      /[a-z]/,
      'Le mot de passe doit contenir au moins une lettre minuscule',
    )
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(
      /[^a-zA-Z0-9]/,
      'Le mot de passe doit contenir au moins un caractère spécial',
    ),
  name: z.string().min(2, 'Le nom est trop court'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
