import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { BoardColumn } from "@/types/boardColumn";
import { Ticket } from "@/types/tickets";
import { apiFetch } from "@/lib/api";

const TICKET_STEP = 1000;
const STEP_DIVISE = 2;

interface TicketIndex {
  sourceColumnIndex: number;
  ticketToMove: Ticket | undefined;
}

interface TargetColumn {
  targetColumnIndex: number;
  realTargetColumnId: string;
}

const findTicketIndex = (
  columns: BoardColumn[],
  ticketId: string,
): TicketIndex => {
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

  return { sourceColumnIndex, ticketToMove };
};

const findTargetColumn = (
  columns: BoardColumn[],
  droppedOnId: string,
): TargetColumn | undefined => {
  let targetColumnIndex = columns.findIndex((col) => col.id === droppedOnId);
  if (targetColumnIndex === -1) {
    targetColumnIndex = columns.findIndex((col) =>
      col.tickets.some((t) => t.id === droppedOnId),
    );
  }

  if (targetColumnIndex === -1) return;

  const realTargetColumnId = columns[targetColumnIndex].id;

  return { targetColumnIndex, realTargetColumnId };
};

const calculateNewPosition = (
  prevTicket: Ticket | undefined,
  nextTicket: Ticket | undefined,
): number => {
  if (!prevTicket && !nextTicket) {
    // Si colonne vide alors index 1000
    return TICKET_STEP;
  }

  if (!prevTicket && nextTicket) {
    // Si le ticket est laché en haut de la colonne on prend l'index du suivant et on le divise par 2
    return nextTicket.position / STEP_DIVISE;
  }

  if (prevTicket && !nextTicket) {
    // S'il est laché en bas d'une colonne on fait simplement +1000 par rapport au dernier des tickets
    return prevTicket.position + TICKET_STEP;
  }

  if (prevTicket && nextTicket) {
    // S'il est pris entre deux ticket on fait une moyenne de la position des deux
    return (prevTicket.position + nextTicket.position) / STEP_DIVISE;
  }

  // Fallback de sécurité
  return TICKET_STEP;
};

export function useKanbanDragAndDrop(
  initialColumns: BoardColumn[],
  token: string,
) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [prevInitialColumns, setPrevInitialColumns] =
    useState<BoardColumn[]>(initialColumns);

  if (initialColumns !== prevInitialColumns) {
    setPrevInitialColumns(initialColumns);
    setColumns(initialColumns);
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over?.id) return;

    const ticketId = active.id.toString();
    const droppedOnId = over.id.toString();

    const { sourceColumnIndex, ticketToMove } = findTicketIndex(
      columns,
      ticketId,
    );

    if (!ticketToMove) return;

    const target = findTargetColumn(columns, droppedOnId);
    if (!target) return;

    const { targetColumnIndex, realTargetColumnId } = target;

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

    const newPosition = calculateNewPosition(prevTicket, nextTicket);

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

  return {
    columns,
    setColumns,
    handleDragEnd,
  };
}
