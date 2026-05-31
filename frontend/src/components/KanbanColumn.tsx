"use client";

import { Ticket } from "@/types/tickets";
import { useDroppable } from "@dnd-kit/core";
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  tickets: Ticket[];
  token: string;
}

export default function KanbanColumn({
  title,
  status,
  tickets,
  token,
}: Readonly<KanbanColumnProps>) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <>
      <h2>{title}</h2>
      <ul
        className="bg-gray-200 p-4 rounded-lg w-1/3 min-h-75"
        ref={setNodeRef}
      >
        {tickets
          .filter((ticket) => ticket.status === status)
          .map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} token={token} />
          ))}
      </ul>
    </>
  );
}
