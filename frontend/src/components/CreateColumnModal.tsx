"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { BoardColumn } from "@/types/boardColumn";
import { X, Loader2, Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  token: string;
  onSuccess: (newColumn: BoardColumn) => void;
}

export function CreateColumnModal({
  isOpen,
  onClose,
  projectId,
  token,
  onSuccess,
}: Readonly<Props>) {
  const [name, setName] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const newColumn = await apiFetch<BoardColumn>(
        `/columns/${projectId}`,
        { method: "POST", body: JSON.stringify({ name, isLocked }) },
        token,
      );
      onSuccess(newColumn);
      setName("");
      setIsLocked(false);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la colonne");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border-dim rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border-dim flex justify-between items-center bg-surface">
          <h3 className="text-lg font-bold text-text-main tracking-tight">
            Nouvelle colonne
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <p className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="columnName"
              className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider"
            >
              Nom de la colonne
            </label>
            <input
              id="columnName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Assurance Qualité, Bug..."
              className="w-full h-10 px-3 rounded-md border border-border-dim text-sm outline-none transition-all bg-background text-text-main placeholder:text-border-focus focus:border-border-focus focus:ring-1 focus:ring-border-focus"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start gap-3 mt-2 p-3 bg-background border border-border-dim rounded-md">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="isLocked"
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 bg-surface border-border-dim rounded text-accent focus:ring-accent focus:ring-offset-0 transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="isLocked"
                className="text-sm font-medium text-text-main flex items-center gap-1.5 cursor-pointer select-none"
              >
                <Lock className="w-3.5 h-3.5 text-text-muted" />
                Verrouiller la colonne
              </label>
              <p className="text-[11px] text-text-muted mt-1">
                Seul le Product Owner ou l&apos;Owner pourront y déplacer des
                tickets.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-dim rounded-md hover:bg-surface-hover hover:border-border-focus transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-md transition-all hover:opacity-90 disabled:opacity-50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer la colonne
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
