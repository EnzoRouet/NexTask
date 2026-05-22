"use client";

import { Ticket, TicketStatus } from "@/app/[projectId]/board/page";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { apiFetch } from "@/lib/api";
import { CreateTicketModal } from "./CreateTicketModal";

export default function KanbanBoard({
  initialTickets,
  token,
  projectId,
}: Readonly<{
  initialTickets: Ticket[];
  token: string;
  projectId: string;
}>) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const moveTicket = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket,
      ),
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over?.id) {
      return;
    }
    const previousTickets = tickets;

    moveTicket(active.id.toString(), over.id as TicketStatus);

    try {
      await apiFetch<Ticket>(
        `/tickets/${active.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: over.id as TicketStatus }),
        },
        token,
      );
    } catch (error) {
      console.error("[Drag Error]: Le serveur a refusé le déplacement", error);
      setTickets(previousTickets);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        + Nouveau Ticket
      </button>
      <div className="flex gap-6">
        <DndContext onDragEnd={handleDragEnd} id="kanban-board">
          <KanbanColumn title="TODO" status="TODO" tickets={tickets} />

          <KanbanColumn
            title="IN_PROGRESS"
            status="IN_PROGRESS"
            tickets={tickets}
          />

          <KanbanColumn title="DONE" status="DONE" tickets={tickets} />
        </DndContext>
      </div>
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        token={token}
      />
    </>
  );
}
