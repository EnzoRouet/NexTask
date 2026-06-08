"use client";

import { useDroppable } from "@dnd-kit/core";
import { TicketCard } from "./TicketCard";
import { BoardColumn } from "@/types/boardColumn";
import { SortableContext } from "@dnd-kit/sortable";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { User } from "./KanbanBoard";
import { Ticket } from "@/types/tickets";

interface KanbanColumnProps {
  column: BoardColumn;
  token: string;
  user: User;
  onTicketClick: (ticket: Ticket) => void;
}

export default function KanbanColumn({
  column,
  token,
  user,
  onTicketClick,
}: Readonly<KanbanColumnProps>) {
  const router = useRouter();

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleDeleteColumn = async () => {
    if (
      !window.confirm(
        `Supprimer la colonne "${column.name}" ? (Elle doit être vide)`,
      )
    )
      return;

    try {
      await apiFetch(`/columns/${column.id}`, { method: "DELETE" }, token);
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="font-bold text-gray-700">{column.name}</h2>

        <button
          onClick={handleDeleteColumn}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200"
          title="Supprimer la colonne"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <ul
        className="bg-gray-100 p-4 rounded-lg min-h-75 border border-gray-200"
        ref={setNodeRef}
      >
        <SortableContext items={column.tickets.map((t) => t.id)}>
          {column.tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              token={token}
              currentUser={user}
              onTicketClick={onTicketClick}
            />
          ))}
        </SortableContext>
      </ul>
    </div>
  );
}
