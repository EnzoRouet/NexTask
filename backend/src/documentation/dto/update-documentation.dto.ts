import { z } from 'zod';
import { CreateDocumentationSchema } from './create-documentation.dto';

export const UpdateDocumentationSchema = CreateDocumentationSchema.omit({
  projectId: true,
}).partial();

export type UpdateDocumentationDto = z.infer<typeof UpdateDocumentationSchema>;
