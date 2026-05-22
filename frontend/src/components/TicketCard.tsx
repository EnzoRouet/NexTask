"use client";

import { Ticket } from "@/app/[projectId]/board/page";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: Readonly<TicketCardProps>) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-3 mb-2 shadow rounded text-black cursor-grab active:cursor-grabbing"
    >
      {ticket.title}
    </li>
  );
}
