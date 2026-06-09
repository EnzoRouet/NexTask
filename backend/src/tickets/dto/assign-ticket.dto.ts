import { z } from 'zod';

export const AssignTicketSchema = z.object({
  targetUserId: z
    .uuid("Le format de l'id de l'utilisateur ciblé n'est pas le bon")
    .nullable(),
});

export type AssignTicketDto = z.infer<typeof AssignTicketSchema>;
