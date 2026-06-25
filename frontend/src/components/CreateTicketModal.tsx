import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import {
  CreateTicketSchema,
  type CreateTicketDto,
} from "@/lib/validations/ticket";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Ticket } from "@/types/tickets";
import { useSocket } from "@/providers/socket.provider";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  token: string;
  columnId: string;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  projectId,
  token,
  columnId,
}: Readonly<CreateTicketModalProps>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketDto>({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      title: "",
      projectId: projectId,
      columnId: columnId,
      priority: "MEDIUM",
    },
  });

  const router = useRouter();
  const { socket } = useSocket();

  const onSubmit = async (data: CreateTicketDto) => {
    try {
      const newTicket = await apiFetch<Ticket>(
        "/tickets",
        { method: "POST", body: JSON.stringify({ ...data, columnId }) },
        token,
      );

      socket?.emit("create_ticket", {
        projectId,
        columnId,
        ticket: newTicket,
      });

      reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Erreur système :", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border-dim rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border-dim flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-text-main tracking-tight">
            Nouveau ticket
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
            >
              Titre du ticket <span className="text-accent">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Configurer la base Prisma"
              {...register("title")}
              className={`w-full h-10 px-3 rounded-md border text-sm outline-none transition-all bg-background text-text-main placeholder:text-border-focus ${
                errors.title
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                  : "border-border-dim focus:border-border-focus focus:ring-1 focus:ring-border-focus"
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
            >
              Priorité
            </label>
            <select
              id="priority"
              {...register("priority")}
              className="w-full h-10 px-3 rounded-md border border-border-dim text-sm outline-none transition-all focus:border-border-focus focus:ring-1 focus:ring-border-focus text-text-main bg-background cursor-pointer"
            >
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
            </select>
            {errors.priority && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-dim rounded-md hover:bg-surface-hover hover:border-border-focus transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-md transition-all hover:opacity-90 disabled:opacity-50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
