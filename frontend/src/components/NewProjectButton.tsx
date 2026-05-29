"use client";

import { useState } from "react";
import { CreateProjectModal } from "./CreateProjetModal";

export function NewProjectButton({ token }: Readonly<{ token: string }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
      >
        + Nouveau Projet
      </button>

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        token={token}
        name=""
      />
    </>
  );
}
