"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  CreateProjectDto,
  CreateProjectSchema,
} from "@/lib/validations/project";
import { Project } from "@/types/projects";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  token: string;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  name,
  token,
}: Readonly<CreateProjectModalProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectDto>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: name,
      description: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data: CreateProjectDto) => {
    try {
      await apiFetch<Project>(
        "/projects",
        { method: "POST", body: JSON.stringify(data) },
        token,
      );

      reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Erreur système :", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-surface border border-border-dim rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Créer un nouveau projet
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, (erreursZod) =>
            console.log("Zod bloque car :", erreursZod),
          )}
          className="p-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Titre du projet <span className="text-accent">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Refonte du site vitrine"
              {...register("name")}
              className={`w-full h-11 px-3 rounded-lg border text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 shadow-inner ${
                errors.name
                  ? "border-red-500/50 focus:border-red-500 focus:bg-red-500/5 focus:ring-1 focus:ring-red-500/50"
                  : "border-white/10 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              }`}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-400 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-text-main bg-transparent border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le projet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
