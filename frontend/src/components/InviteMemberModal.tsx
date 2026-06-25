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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-surface border border-border-dim rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Inviter un membre
          </h3>
          <button
            onClick={() => {
              reset();
              setApiError("");
              onClose();
            }}
            disabled={isSubmitting}
            className="text-text-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 flex flex-col gap-6"
        >
          {apiError && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm font-medium">
              {apiError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              placeholder="jean.dupont@coda.fr"
              {...register("email")}
              className={`w-full h-11 px-3 rounded-lg border text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 shadow-inner ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500 focus:bg-red-500/5 focus:ring-1 focus:ring-red-500/50"
                  : "border-white/10 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="role"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Rôle sur le projet
            </label>
            <select
              id="role"
              {...register("role")}
              className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 text-white bg-surface cursor-pointer shadow-inner"
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
