"use client";

import { useState } from "react";
import { CreateProjectModal } from "./CreateProjetModal";

export function NewProjectButton({ token }: Readonly<{ token: string }>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center gap-2"
      >
        <span className="text-lg leading-none mb-0.5">+</span> Nouveau Projet
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
