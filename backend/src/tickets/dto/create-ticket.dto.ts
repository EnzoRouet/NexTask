import { z } from 'zod';

export const CreateTicketSchema = z.object({
  title: z.string().min(1, 'Le titre du ticket est obligatoire'),
  projectId: z.uuid("Format de l'ID du projet invalide"),
  columnId: z.uuid("Format de L'ID de la colonne invalide"),
  description: z
    .string()
    .min(3, 'La description de votre ticket est trop courte')
    .optional(),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
