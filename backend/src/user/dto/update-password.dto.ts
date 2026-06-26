import { z } from 'zod';

export const UpdatePasswordSchema = z
  .object({
    oldPassword: z.string().trim(),
    newPassword: z
      .string()
      .min(12, {
        message:
          'Le nouveau mot de passe doit contenir au moins 12 caractères.',
      })
      .regex(/[A-Z]/, {
        message:
          'Le nouveau mot de passe doit contenir au moins une majuscule.',
      })
      .regex(/[a-z]/, {
        message:
          'Le nouveau mot de passe doit contenir au moins une minuscule.',
      })
      .regex(/\d/, {
        message: 'Le nouveau mot de passe doit contenir au moins un chiffre.',
      })
      .regex(/[^A-Za-z0-9]/, {
        message:
          'Le nouveau mot de passe doit contenir au moins un caractère spécial.',
      })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les nouveaux mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;
