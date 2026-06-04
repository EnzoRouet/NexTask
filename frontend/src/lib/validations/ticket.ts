import { z } from "zod";

export const CreateTicketSchema = z.object({
  title: z.string().min(3, "Le titre est trop court"),
  projectId: z.uuid("Format de l'ID du projet invalide"),
  columnId: z.uuid("Format de l'ID de la colonne invalide"),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
