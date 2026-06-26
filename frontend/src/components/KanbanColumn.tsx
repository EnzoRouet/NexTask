"use client";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TicketCard } from "./TicketCard";
import { BoardColumn } from "@/types/boardColumn";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Trash2, GripHorizontal } from "lucide-react";
import { User } from "./KanbanBoard";
import { Ticket } from "@/types/tickets";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

interface KanbanColumnProps {
  column: BoardColumn;
  token: string;
  user: User;
  projectRole: "OWNER" | "PO" | "DEVELOPER";
  onTicketClick: (ticket: Ticket) => void;
}

export default function KanbanColumn({
  column,
  token,
  user,
  projectRole,
  onTicketClick,
}: Readonly<KanbanColumnProps>) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. On remplace useDroppable par useSortable
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    // On injecte le type exact pour que le Board le reconnaisse
    data: {
      type: "Column",
      column,
    },
  });

  // 2. On calcule le style de déplacement physique
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const executeDeleteColumn = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/columns/${column.id}`, { method: "DELETE" }, token);
      router.refresh();
      setIsDeleteModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex flex-col w-[320px] shrink-0 group ${isDragging ? "z-50" : "z-auto"}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="flex justify-between items-center mb-3 px-1 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-md transition-colors p-1 -ml-1"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              {column.name}
            </h2>
            <span className="text-[11px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border-dim shadow-inner">
              {column.tickets.length}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-text-muted hover:text-red-400 transition-all duration-200 p-1.5 rounded-md hover:bg-surface-hover opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Supprimer la colonne"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <ul className="relative bg-surface/50 p-2 rounded-xl min-h-62.5 border border-border-dim flex flex-col gap-2 transition-colors">
          {column.tickets.length === 0 && (
            <div className="absolute inset-2 border-2 border-dashed border-border-dim rounded-lg flex items-center justify-center pointer-events-none select-none">
              <span className="text-xs font-medium text-text-muted opacity-50">
                Glissez un ticket ici
              </span>
            </div>
          )}

          <SortableContext
            items={column.tickets.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {column.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  token={token}
                  currentUser={user}
                  projectRole={projectRole}
                  onTicketClick={onTicketClick}
                />
              ))}
            </div>
          </SortableContext>
        </ul>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteColumn}
        title="Supprimer la colonne"
        description={`Êtes-vous sûr de vouloir supprimer la colonne "${column.name}" ? Elle doit impérativement être vide pour être supprimée.`}
        confirmText="Supprimer"
        isLoading={isDeleting}
      />
    </>
  );
}
