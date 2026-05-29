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
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-neutral-900">
            Créer un nouveau projet
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, (erreursZod) =>
            console.log("Zod bloque car :", erreursZod),
          )}
          className="p-6 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Titre du projet <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Refonte du site vitrine"
              {...register("name")}
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all ${
                errors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.name && (
              <p className="mt-1 flex text-xs text-red-500 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
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
