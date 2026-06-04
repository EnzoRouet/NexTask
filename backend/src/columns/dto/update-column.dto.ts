import { z } from 'zod';
import { CreateColumnSchema } from './create-column.dto';

export const UpdateColumnSchema = CreateColumnSchema.partial();

export type UpdateColumnDto = z.infer<typeof UpdateColumnSchema>;
