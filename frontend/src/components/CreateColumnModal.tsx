"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { BoardColumn } from "@/types/boardColumn";
import { X, Loader2 } from "lucide-react";

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
        {
          method: "POST",
          body: JSON.stringify({ name }),
        },
        token,
      );

      onSuccess(newColumn);
      setName("");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la colonne");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Nouvelle étape
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="columnName"
              className="text-sm font-medium text-gray-700"
            >
              Nom de la colonne
            </label>
            <input
              id="columnName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: QA, En attente..."
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
