import { z } from 'zod';

export const CreateDocumentationSchema = z.object({
  title: z.string().min(1, 'Le titre du document est trop court'),
  content: z.string().optional().nullable(),
  projectId: z.uuid("Format d'ID de projet invalide"),
});

export type CreateDocumentationDto = z.infer<typeof CreateDocumentationSchema>;
