import { z } from 'zod';
import { CreateTicketSchema } from './create-ticket.dto';

export const UpdateTicketSchema = CreateTicketSchema.partial().extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
});

export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
