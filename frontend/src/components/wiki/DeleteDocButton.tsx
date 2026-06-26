"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

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

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/documentation/${docId}`, { method: "DELETE" }, token);
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
        className="p-2 text-text-muted hover:text-red-400 hover:bg-surface rounded-md transition-all duration-200"
        title="Supprimer le document"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={executeDelete}
        title="Supprimer le document"
        description="Cette action est irréversible. Le document sera définitivement effacé du wiki du projet."
        confirmText="Supprimer"
        isLoading={isDeleting}
      />
    </>
  );
};
