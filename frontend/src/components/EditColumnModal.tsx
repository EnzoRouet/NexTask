"use client";

import { useState } from "react";
import { X, Loader2, Lock, Unlock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { BoardColumn } from "@/types/boardColumn";

interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: BoardColumn | null;
  token: string;
  onSuccess: (updatedColumn: BoardColumn) => void;
}

export function EditColumnModal({
  isOpen,
  onClose,
  column,
  token,
  onSuccess,
}: Readonly<EditColumnModalProps>) {
  const [name, setName] = useState(column?.name || "");
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !column) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedColumn = await apiFetch<BoardColumn>(
        `/columns/${column.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name, isLocked }),
        },
        token,
      );

      onSuccess(updatedColumn);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message || "Impossible de modifier la colonne.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-all">
      <div className="bg-surface border border-border-dim rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col overflow-hidden relative">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Éditer la colonne
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-text-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Nom de la colonne
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: À FAIRE"
              className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="isLocked"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Sécurité de la colonne
            </label>
            <div className="relative">
              <select
                id="isLocked"
                value={isLocked ? "true" : "false"}
                onChange={(e) => setIsLocked(e.target.value === "true")}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-white/10 text-sm outline-none transition-all focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 text-white bg-surface cursor-pointer shadow-inner appearance-none"
              >
                <option value="false">Standard</option>
                <option value="true">Verrouillée (PO/Owner uniquement)</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                {isLocked ? (
                  <Lock className="w-4 h-4 text-red-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              Une colonne verrouillée empêche les développeurs d&apos;y glisser
              des tickets. Seuls les Product Owners peuvent le faire.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-text-main bg-transparent border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Sauvegarder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
