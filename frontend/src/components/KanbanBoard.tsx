"use client";

import { Ticket, TicketStatus } from "@/app/board/page";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

export default function KanbanBoard({
  initialTickets,
}: Readonly<{
  initialTickets: Ticket[];
}>) {
  const [tickets, setTickets] = useState(initialTickets);

  const moveTicket = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over?.id) {
      return;
    }

    moveTicket(active.id.toString(), over.id as TicketStatus);
  };

  return (
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
  );
}
