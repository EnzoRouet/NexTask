"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DocSummary } from "@/types/documentation";
import { Loader2 } from "lucide-react";

interface CreateDocButtonProps {
  projectId: string;
  token: string;
}

export const CreateDocButton = ({ projectId, token }: CreateDocButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const newDoc = await apiFetch<DocSummary>(
        `/documentation`,
        {
          method: "POST",
          body: JSON.stringify({ title: "Sans titre", projectId }),
        },
        token,
      );
      router.push(`/${projectId}/docs/${newDoc.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du document :", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] disabled:opacity-50 min-w-40"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Création...
        </>
      ) : (
        <>
          <span className="text-lg leading-none mb-0.5">+</span> Nouveau
          Document
        </>
      )}
    </button>
  );
};
