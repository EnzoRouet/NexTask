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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-surface border border-border-dim rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Nouvelle colonne
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {error && (
            <p className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm font-medium">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="columnName"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Nom de la colonne
            </label>
            <input
              id="columnName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Assurance Qualité, Bug..."
              className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 shadow-inner"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start gap-3 mt-1 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="isLocked"
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 bg-white/10 border-white/20 rounded text-accent focus:ring-accent focus:ring-offset-0 transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="isLocked"
                className="text-sm font-medium text-white flex items-center gap-1.5 cursor-pointer select-none"
              >
                <Lock className="w-3.5 h-3.5 text-text-muted" />
                Verrouiller la colonne
              </label>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
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
              className="px-4 py-2 text-sm font-medium text-text-main bg-transparent border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
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
