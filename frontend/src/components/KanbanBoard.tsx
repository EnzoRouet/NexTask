"use client";

import { Project } from "@/types/projects";
import { BoardColumn } from "@/types/boardColumn";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { apiFetch } from "@/lib/api";
import { CreateTicketModal } from "./CreateTicketModal";
import { CreateColumnModal } from "./CreateColumnModal";
import { Ticket } from "@/types/tickets";

export interface User {
  id: string;
  role: "USER" | "ADMIN";
}

export default function KanbanBoard({
  project,
  token,
  user,
}: Readonly<{
  project: Project;
  token: string;
  user: User;
}>) {
  const [columns, setColumns] = useState<BoardColumn[]>(project.columns);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [prevProject, setPrevProject] = useState<Project>(project);

  if (project !== prevProject) {
    setPrevProject(project);
    setColumns(project.columns);
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over?.id) return;

    const ticketId = active.id.toString();
    const droppedOnId = over.id.toString();

    let sourceColumnIndex = -1;
    let ticketToMove: Ticket | undefined;

    // On trouve où est le ticket actuellement
    for (let i = 0; i < columns.length; i++) {
      const found = columns[i].tickets.find((t) => t.id === ticketId);
      if (found) {
        sourceColumnIndex = i;
        ticketToMove = found;
        break;
      }
    }

    if (!ticketToMove) return;

    // On trouve la colonne cible
    let targetColumnIndex = columns.findIndex((col) => col.id === droppedOnId);
    if (targetColumnIndex === -1) {
      targetColumnIndex = columns.findIndex((col) =>
        col.tickets.some((t) => t.id === droppedOnId),
      );
    }

    if (targetColumnIndex === -1) return;
    const realTargetColumnId = columns[targetColumnIndex].id;

    const previousColumns = [...columns];

    // On crée un copie pour la manipuler et pas interférer avec les données de bases
    const newColumns = columns.map((col) => ({
      ...col,
      tickets: [...col.tickets],
    }));

    // On dégage le ticket de son ancien emplacement
    const sourceTickets = newColumns[sourceColumnIndex].tickets;
    const activeTicketIndex = sourceTickets.findIndex((t) => t.id === ticketId);
    sourceTickets.splice(activeTicketIndex, 1);

    const targetTickets = newColumns[targetColumnIndex].tickets;
    let newIndex = targetTickets.length;

    if (droppedOnId !== realTargetColumnId) {
      const dropIndex = targetTickets.findIndex((t) => t.id === droppedOnId);
      if (dropIndex !== -1) {
        const originalDropIndex = columns[targetColumnIndex].tickets.findIndex(
          (t) => t.id === droppedOnId,
        );
        const isDraggingDown =
          sourceColumnIndex === targetColumnIndex &&
          activeTicketIndex < originalDropIndex;
        newIndex = isDraggingDown ? dropIndex + 1 : dropIndex;
      }
    }

    targetTickets.splice(newIndex, 0, ticketToMove);

    const prevTicket = targetTickets[newIndex - 1];
    const nextTicket = targetTickets[newIndex + 1];

    let newPosition: number;

    if (!prevTicket && !nextTicket) {
      // Si colonne vide alors index 1000
      newPosition = 1000;
    } else if (!prevTicket) {
      // Si le ticket est laché en haut de la colonne on prend l'index du suivant et on le divise par 2
      newPosition = nextTicket.position / 2;
    } else if (!nextTicket) {
      // S'il est laché en bas d'une colonne on fait simplement +1000 par rapport au dernier des tickets
      newPosition = prevTicket.position + 1000;
    } else {
      // S'il est pris entre deux ticket on fait une moyenne de la position des deux
      newPosition = (prevTicket.position + nextTicket.position) / 2;
    }

    ticketToMove.position = newPosition;
    ticketToMove.columnId = realTargetColumnId;
    setColumns(newColumns);

    try {
      await apiFetch<Ticket>(
        `/tickets/${ticketId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            columnId: realTargetColumnId,
            position: newPosition,
          }),
        },
        token,
      );
    } catch (error) {
      console.error("[Drag Error]: Le serveur a refusé le déplacement", error);
      setColumns(previousColumns);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 shadow-sm hover:bg-blue-700 transition-colors"
      >
        + Nouveau Ticket
      </button>

      <button
        onClick={() => setIsCreateColumnModalOpen(true)}
        className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-900 transition-colors"
      >
        + Nouvelle Colonne
      </button>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <DndContext onDragEnd={handleDragEnd} id="kanban-board">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              token={token}
              user={user}
            />
          ))}
        </DndContext>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={project.id}
        token={token}
        columnId={project.columns[0]?.id || ""}
      />

      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
        projectId={project.id}
        token={token}
        onSuccess={(newColumn) => {
          setColumns([...columns, { ...newColumn, tickets: [] }]);
        }}
      />
    </>
  );
}
