"use client";

import { useDroppable } from "@dnd-kit/core";
import { TicketCard } from "./TicketCard";
import { BoardColumn } from "@/types/boardColumn";
import { SortableContext } from "@dnd-kit/sortable";

interface KanbanColumnProps {
  column: BoardColumn;
  token: string;
}

export default function KanbanColumn({
  column,
  token,
}: Readonly<KanbanColumnProps>) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <>
      <h2>{column.name}</h2>
      <ul
        className="bg-gray-200 p-4 rounded-lg w-1/3 min-h-75"
        ref={setNodeRef}
      >
        <SortableContext items={column.tickets.map((t) => t.id)}>
          {column.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} token={token} />
          ))}
        </SortableContext>
      </ul>
    </>
  );
}
