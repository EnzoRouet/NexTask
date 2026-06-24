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
  user: {
    id: string;
    name: string;
  };
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

    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 3000);

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
        {
          method: "PATCH",
          body: JSON.stringify({ [field]: value }),
        },
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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="mb-6 pr-8 -ml-2">
            <input
              type="text"
              className="w-full text-2xl font-bold text-neutral-800 bg-transparent border border-transparent hover:bg-neutral-50 hover:border-neutral-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-2 py-1 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleUpdate("title", title)}
              placeholder="Titre du ticket..."
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Assigné à
                </label>

                {isFetchingMembers ? (
                  <div className="flex items-center gap-2 text-neutral-500 text-sm p-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                  </div>
                ) : (
                  <select
                    className="w-full border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 appearance-none"
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

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Priorité
                </label>
                <select
                  className="w-full border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 appearance-none"
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                className="w-full bg-neutral-50 p-4 rounded-lg border border-transparent hover:border-neutral-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 min-h-30 text-neutral-700 outline-none transition-all resize-y"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleUpdate("description", description)}
                placeholder="Ajouter une description plus détaillée..."
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-4 border-t border-transparent">
          {isSaving && (
            <div className="flex items-center gap-2 text-neutral-500 text-sm animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-all font-medium text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
          >
            Terminer
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 mx-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
