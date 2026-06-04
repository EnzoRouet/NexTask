"use client";

import { Ticket } from "@/types/tickets";
import { useSortable } from "@dnd-kit/sortable";
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
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
      className="bg-white p-3 mb-2 shadow-sm border border-neutral-200 rounded-lg text-neutral-800 cursor-grab active:cursor-grabbing flex justify-between items-center group transition-colors hover:border-neutral-300 relative"
    >
      <span className="font-medium text-sm pr-6">{ticket.title}</span>

      <button
        onClick={handleDelete}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={isDeleting}
        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 absolute right-2 p-1.5 rounded-md hover:bg-red-50 flex items-center justify-center"
        title="Supprimer le ticket"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </li>
  );
}
