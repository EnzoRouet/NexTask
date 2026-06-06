import { z } from 'zod';

export const CreateProjectMemberSchema = z.object({
  email: z.email("Format de l'email invalide "),
  role: z.enum(['PO', 'DEVELOPER']),
});

export type CreateProjectMemberDto = z.infer<typeof CreateProjectMemberSchema>;
