import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(3, "Le nom de votre projet est trop court"),
  description: z
    .string()
    .min(3, "La description du projet est trop courte")
    .or(z.literal(""))
    .optional(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
