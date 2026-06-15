"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DocSummary } from "@/types/documentation";

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
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50 flex items-center justify-center min-w-[160px]"
    >
      {isLoading ? "Création..." : "+ Nouveau Document"}
    </button>
  );
};
