"use client";

import { Ticket } from "@/types/tickets";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Loader2, Lock, UserPlus } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/color";
import { useSocket } from "@/providers/socket.provider";
import { ConfirmModal } from "./ConfirmModal";

interface TicketCardProps {
  ticket: Ticket;
  token: string;
  currentUser: { id: string; role: string };
  projectRole: "OWNER" | "PO" | "DEVELOPER";
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketCard({
  ticket,
  token,
  currentUser,
  projectRole,
  onTicketClick,
}: Readonly<TicketCardProps>) {
  const router = useRouter();
  const { socket } = useSocket();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isSuperVisor = projectRole === "OWNER" || projectRole === "PO";

  const canEdit =
    isSuperVisor ||
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setIsDeleteModalOpen(true);
  };

  const executeDeleteTicket = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/tickets/${ticket.id}`, { method: "DELETE" }, token);

      socket?.emit("delete_ticket", {
        projectId: ticket.projectId,
        columnId: ticket.columnId,
        ticketId: ticket.id,
      });

      router.refresh();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Erreur système :", error);
      alert("Impossible de supprimer le ticket.");
      setIsDeleting(false);
    }
  };

  const handleAssign = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAssigning(true);

    try {
      const updatedTicket = await apiFetch<Ticket>(
        `/tickets/${ticket.id}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ targetUserId: currentUser.id }),
        },
        token,
      );

      socket?.emit("assign_ticket", {
        projectId: ticket.projectId,
        columnId: ticket.columnId,
        ticketId: ticket.id,
        assigneeId: updatedTicket.assigneeId,
        assignee: updatedTicket.assignee,
      });

      router.refresh();
    } catch (error) {
      console.error("Erreur système :", error);
      alert("Impossible de s'assigner le ticket.");
      setIsAssigning(false);
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/80";
      case "MEDIUM":
        return "bg-accent/80";
      case "LOW":
        return "bg-text-muted/50";
      default:
        return "bg-transparent";
    }
  };

  return (
    <>
      <li
        onClick={() => onTicketClick(ticket)}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`bg-surface-hover p-3 mb-2 shadow-sm border rounded-md text-text-main flex justify-between items-start group relative transition-all overflow-hidden ${
          canEdit
            ? "border-border-dim cursor-grab active:cursor-grabbing hover:border-border-focus"
            : "border-transparent bg-surface opacity-60 cursor-not-allowed"
        }`}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-[2px] ${getPriorityColor(ticket.priority)}`}
        />

        <div className="flex flex-col gap-3 w-full pl-2 pr-8">
          <span className="font-medium text-sm flex items-start gap-2 leading-tight">
            {!canEdit && (
              <Lock className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
            )}
            <span>{ticket.title}</span>
          </span>

          <div className="flex items-center gap-2 mt-auto">
            {ticket.assigneeId ? (
              <>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                  style={{
                    backgroundColor: getAvatarColor(
                      ticket.assigneeId,
                      ticket.assignee?.name,
                    ),
                  }}
                  title={ticket.assignee?.name || "Membre assigné"}
                >
                  {getInitials(ticket.assignee?.name)}
                </div>

                {ticket.assigneeId === currentUser.id && (
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Ta tâche
                  </span>
                )}
              </>
            ) : (
              <button
                onClick={handleAssign}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isAssigning}
                className="text-[10px] uppercase font-bold text-accent hover:text-blue-400 w-fit flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isAssigning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                S&apos;assigner
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleDeleteClick}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isDeleting || !canEdit}
          className={`absolute right-2 top-2 p-1.5 rounded-md flex items-center justify-center transition-all ${
            canEdit
              ? "text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-surface disabled:opacity-50"
              : "text-border-dim opacity-0 pointer-events-none"
          }`}
          title="Supprimer le ticket"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </li>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteTicket}
        title="Supprimer le ticket"
        description={`Êtes-vous sûr de vouloir supprimer le ticket "${ticket.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        isLoading={isDeleting}
      />
    </>
  );
}
