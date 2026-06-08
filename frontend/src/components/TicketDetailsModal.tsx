"use client";

import { useState, useEffect } from "react";
import { Ticket } from "@/types/tickets";
import { apiFetch } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      const fetchMembers = async () => {
        setIsLoadingMembers(true);
        try {
          const data = await apiFetch<ProjectMemberResponse[]>(
            `/projects/${ticket.projectId}/members`,
            { method: "GET" },
            token,
          );
          setMembers(data);
        } catch (error) {
          console.error("Erreur chargement membres:", error);
        } finally {
          setIsLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, ticket, token]);

  if (!isOpen || !ticket) return null;

  const handleAssign = async (targetUserId: string) => {
    if (!targetUserId) return;
    setIsUpdating(true);

    try {
      await apiFetch(
        `/tickets/${ticket.id}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ targetUserId }),
        },
        token,
      );
      router.refresh();
    } catch (error) {
      console.error("Erreur assignation:", error);
      alert("Impossible d'assigner le ticket.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 pr-8">
            {ticket.title}
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Assigné à
              </label>

              {isLoadingMembers ? (
                <div className="flex items-center gap-2 text-neutral-500 text-sm p-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement de
                  l&apos;équipe...
                </div>
              ) : (
                <div className="relative w-1/2">
                  <select
                    className="w-full border border-neutral-300 rounded-lg p-2.5 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 appearance-none"
                    value={ticket.assigneeId || ""}
                    onChange={(e) => handleAssign(e.target.value)}
                    disabled={isUpdating}
                  >
                    <option value="" disabled>
                      Sélectionner un développeur
                    </option>
                    {members.map((member) => (
                      <option key={member.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>

                  {isUpdating && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 absolute right-3 top-3" />
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Description
              </label>
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 min-h-30 text-neutral-700 whitespace-pre-wrap">
                {ticket.description || (
                  <span className="italic text-neutral-400">
                    Aucune description fournie pour ce ticket.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
