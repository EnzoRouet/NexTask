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
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-neutral-900">
            Inviter un membre
          </h2>
          <button
            onClick={() => {
              reset();
              setApiError("");
              onClose();
            }}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 flex flex-col gap-4"
        >
          {apiError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {apiError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Adresse email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="jean.dupont@coda.fr"
              {...register("email")}
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all text-neutral-900 ${
                errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Rôle sur le projet <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              {...register("role")}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-neutral-900 bg-white"
            >
              <option value="DEVELOPER">Développeur</option>
              <option value="PO">Product Owner</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setApiError("");
                onClose();
              }}
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
