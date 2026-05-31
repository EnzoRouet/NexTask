"use client";

import { Ticket } from "@/types/tickets";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  token: string;
}

export function TicketCard({ ticket, token }: Readonly<TicketCardProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`Es-tu sûr de vouloir supprimer "${ticket.title}" ?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      await apiFetch(`/tickets/${ticket.id}`, { method: "DELETE" }, token);
      router.refresh();
    } catch (error) {
      console.error("Erreur système :", error);
      alert("Impossible de supprimer le ticket.");
      setIsDeleting(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-3 mb-2 shadow rounded text-black cursor-grab active:cursor-grabbing flex justify-between items-center group"
    >
      <span>{ticket.title}</span>

      <button
        onClick={handleDelete}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={isDeleting}
        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 text-sm font-bold px-2"
        title="Supprimer le ticket"
      >
        {isDeleting ? "" : "X"}
      </button>
    </li>
  );
}
