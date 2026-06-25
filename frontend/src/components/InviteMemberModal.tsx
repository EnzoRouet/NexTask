"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

const InviteMemberSchema = z.object({
  email: z.email("Format d'email invalide"),
  role: z.enum(["PO", "DEVELOPER"]),
});

type InviteMemberDto = z.infer<typeof InviteMemberSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  token: string;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  projectId,
  token,
}: Readonly<InviteMemberModalProps>) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberDto>({
    resolver: zodResolver(InviteMemberSchema),
    defaultValues: {
      email: "",
      role: "DEVELOPER",
    },
  });

  const onSubmit = async (data: InviteMemberDto) => {
    try {
      setApiError("");
      await apiFetch(
        `/projects/${projectId}/members`,
        { method: "POST", body: JSON.stringify(data) },
        token,
      );
      reset();
      onClose();
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setApiError(error.message || "Impossible d'inviter ce membre.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border-dim rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border-dim flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-text-main tracking-tight">
            Inviter un membre
          </h2>
          <button
            onClick={() => {
              reset();
              setApiError("");
              onClose();
            }}
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
          {apiError && (
            <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-md border border-red-500/20">
              {apiError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
            >
              Adresse email <span className="text-accent">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="jean.dupont@coda.fr"
              {...register("email")}
              className={`w-full h-10 px-3 rounded-md border text-sm outline-none transition-all bg-background text-text-main placeholder:text-border-focus ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                  : "border-border-dim focus:border-border-focus focus:ring-1 focus:ring-border-focus"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
            >
              Rôle sur le projet <span className="text-accent">*</span>
            </label>
            <select
              id="role"
              {...register("role")}
              className="w-full h-10 px-3 rounded-md border border-border-dim text-sm outline-none transition-all focus:border-border-focus focus:ring-1 focus:ring-border-focus text-text-main bg-background cursor-pointer"
            >
              <option value="DEVELOPER">Développeur</option>
              <option value="PO">Product Owner</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setApiError("");
                onClose();
              }}
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
                  Invitation...
                </>
              ) : (
                "Inviter le membre"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
