import { z } from 'zod';

export const CreateColumnSchema = z.object({
  name: z.string().min(2, 'Le nom de la colonne est trop court'),
  projectId: z.uuid("Format de l'ID du projet invalide"),
});

export type CreateColumnDto = z.infer<typeof CreateColumnSchema>;
