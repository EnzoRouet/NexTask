"use client";

import { Ticket } from "@/types/tickets";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Loader2, Lock } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  token: string;
  currentUser: { id: string; role: string };
}

export function TicketCard({
  ticket,
  token,
  currentUser,
}: Readonly<TicketCardProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit =
    currentUser.role === "ADMIN" ||
    (!ticket.column?.isLocked &&
      (!ticket.assigneeId || ticket.assigneeId === currentUser.id));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canEdit) return;

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
      className={`bg-white p-3 mb-2 shadow-sm border rounded-lg text-neutral-800 flex justify-between items-center group relative transition-colors ${
        canEdit
          ? "border-neutral-200 cursor-grab active:cursor-grabbing hover:border-neutral-300"
          : "border-neutral-100 bg-neutral-50 opacity-75 cursor-not-allowed"
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm pr-6 flex items-center gap-2">
          {!canEdit && <Lock className="w-3 h-3 text-neutral-400" />}{" "}
          {ticket.title}
        </span>

        {ticket.assigneeId && (
          <span className="text-[10px] uppercase font-bold text-neutral-400">
            {ticket.assigneeId === currentUser.id ? "Ta tâche" : "Assigné"}
          </span>
        )}
      </div>

      <button
        onClick={handleDelete}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={isDeleting || !canEdit}
        className={`absolute right-2 p-1.5 rounded-md flex items-center justify-center transition-opacity ${
          canEdit
            ? "text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 disabled:opacity-50"
            : "text-neutral-300 opacity-0 pointer-events-none"
        }`}
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
