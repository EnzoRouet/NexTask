import { z } from 'zod';
import { CreateTicketSchema } from './create-ticket.dto';

export const UpdateTicketSchema = CreateTicketSchema.partial().extend({
  position: z.number().optional(),
});

export type UpdateTicketDto = z.infer<typeof UpdateTicketSchema>;
