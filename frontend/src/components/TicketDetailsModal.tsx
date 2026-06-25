"use client";

import { useState, useEffect } from "react";
import { Ticket } from "@/types/tickets";
import { apiFetch } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket.provider";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

interface ProjectMemberResponse {
  id: string;
  user: { id: string; name: string };
}

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  token: string;
}

export function TicketDetailsModal({
  isOpen,
  onClose,
  ticket,
  token,
}: Readonly<TicketDetailsModalProps>) {
  const router = useRouter();
  const { socket } = useSocket();

  const [projectMembers, setProjectMembers] = useState<ProjectMemberResponse[]>(
    [],
  );
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("MEDIUM");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    if (isOpen && ticket) {
      const fetchProjectMembers = async () => {
        setIsFetchingMembers(true);
        setTitle(ticket.title);
        setDescription(ticket.description);
        setAssigneeId(ticket.assigneeId);
        setPriority(ticket.priority || "MEDIUM");

        try {
          const data = await apiFetch<ProjectMemberResponse[]>(
            `/projects/${ticket.projectId}/members`,
            { method: "GET" },
            token,
          );
          setProjectMembers(data);
        } catch (error) {
          console.error("Erreur chargement membres:", error);
        } finally {
          setIsFetchingMembers(false);
        }
      };
      fetchProjectMembers();
    }
  }, [isOpen, ticket, token]);

  if (!isOpen || !ticket) return null;

  const handleAssign = async (targetUserId: string | null) => {
    if (!targetUserId) return;
    setIsSaving(true);
    const payloadUserId = targetUserId === "UNASSIGNED" ? null : targetUserId;
    setAssigneeId(payloadUserId);

    try {
      const updatedTicket = await apiFetch<Ticket>(
        `/tickets/${ticket.id}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ targetUserId: payloadUserId }),
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
    } catch {
      setErrorMessage("Impossible d'assigner le ticket.");
      setAssigneeId(ticket.assigneeId);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (
    field: "title" | "description" | "priority",
    value: string | null,
  ) => {
    if (field === "title" && value === ticket.title) return;
    if (field === "description" && value === ticket.description) return;
    if (field === "priority" && value === ticket.priority) return;

    setIsSaving(true);
    try {
      await apiFetch(
        `/tickets/${ticket.id}`,
        { method: "PATCH", body: JSON.stringify({ [field]: value }) },
        token,
      );

      socket?.emit("update_ticket", {
        projectId: ticket.projectId,
        columnId: ticket.columnId,
        ticketId: ticket.id,
        updates: { [field]: value },
      });

      router.refresh();
    } catch {
      if (field === "title") setTitle(ticket.title);
      if (field === "description") setDescription(ticket.description);
      if (field === "priority") setPriority(ticket.priority || "MEDIUM");
      setErrorMessage(`Impossible de modifier la propriété : ${field}.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative border border-border-dim overflow-hidden">
        {/* BOUTON FERMER ABSOLU */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-md transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* TITRE (Input invisible) */}
          <div className="mb-6 pr-8 -ml-2 mt-2">
            <input
              type="text"
              className="w-full text-2xl font-bold text-text-main bg-transparent border border-transparent hover:border-border-dim focus:bg-background focus:border-border-focus rounded-md px-2 py-1 outline-none transition-all placeholder:text-border-focus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleUpdate("title", title)}
              placeholder="Titre du ticket..."
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* ASSIGNATION */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Assigné à
                </label>
                {isFetchingMembers ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm p-2.5 bg-background border border-border-dim rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                  </div>
                ) : (
                  <select
                    className="w-full bg-background border border-border-dim rounded-md p-2.5 text-sm text-text-main focus:outline-none focus:border-border-focus transition-all cursor-pointer disabled:opacity-50"
                    value={assigneeId || "UNASSIGNED"}
                    onChange={(e) => handleAssign(e.target.value)}
                    disabled={isSaving}
                  >
                    <option value="" disabled>
                      Sélectionner un développeur
                    </option>
                    <option value="UNASSIGNED">Non assigné</option>
                    {projectMembers.map((member) => (
                      <option key={member.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* PRIORITÉ */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Priorité
                </label>
                <select
                  className="w-full bg-background border border-border-dim rounded-md p-2.5 text-sm text-text-main focus:outline-none focus:border-border-focus transition-all cursor-pointer disabled:opacity-50"
                  value={priority}
                  onChange={(e) => {
                    const newPriority = e.target.value as Priority;
                    setPriority(newPriority);
                    handleUpdate("priority", newPriority);
                  }}
                  disabled={isSaving}
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Description
              </label>
              <textarea
                className="w-full bg-background p-4 rounded-md border border-border-dim hover:border-border-focus focus:border-accent focus:ring-1 focus:ring-accent/50 min-h-[140px] text-sm text-text-main outline-none transition-all resize-y placeholder:text-border-focus custom-scrollbar"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleUpdate("description", description)}
                placeholder="Ajouter une description plus détaillée..."
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-border-dim bg-background/50">
          <div className="flex items-center">
            {isSaving ? (
              <div className="flex items-center gap-2 text-text-muted text-xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement automatique...</span>
              </div>
            ) : (
              <span className="text-text-muted text-xs">
                Toutes les modifications sont enregistrées.
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-dim rounded-md hover:bg-surface-hover hover:border-border-focus transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* ERREUR FLOTTANTE */}
        {errorMessage && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-3 text-red-500 text-sm shadow-lg animate-in slide-in-from-bottom-4">
            <span className="font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
