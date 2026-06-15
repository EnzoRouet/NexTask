"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface DeleteDocButtonProps {
  projectId: string;
  docId: string;
  token: string;
}

export const DeleteDocButton = ({
  projectId,
  docId,
  token,
}: DeleteDocButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(
        `/documentation/${docId}`,
        {
          method: "DELETE",
        },
        token,
      );

      router.push(`/${projectId}/docs`);
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
        title="Supprimer le document"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* La Modale */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">
              Supprimer le document ?
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Cette action est irréversible. Le document sera définitivement
              effacé de la base de données.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
