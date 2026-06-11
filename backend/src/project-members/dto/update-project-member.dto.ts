import { z } from 'zod';
import { ProjectRole } from '@prisma/client';

export const UpdateProjectMemberSchema = z.object({
  role: z.enum(ProjectRole),
});

export type UpdateProjectMemberDto = z.infer<typeof UpdateProjectMemberSchema>;
