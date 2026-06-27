import { useState, useEffect } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "@/types/boardColumn";
import { Ticket } from "@/types/tickets";
import { apiFetch } from "@/lib/api";
import { useSocket } from "@/providers/socket.provider";

const TICKET_STEP = 1000;
const STEP_DIVISE = 2;

export interface ColumnMovedPayload {
  projectId: string;
  columnId: string;
  oldIndex: number;
  newIndex: number;
}

interface TicketMovedPayload {
  projectId: string;
  ticketId: string;
  newColumnId: string;
  newPosition: number;
}

export interface TicketCreatedPayload {
  projectId: string;
  columnId: string;
  ticket: Ticket;
}

export interface TicketDeletedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
}

export interface TicketUpdatedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
  updates: Partial<Ticket>;
}

export interface TicketAssignedPayload {
  projectId: string;
  columnId: string;
  ticketId: string;
  assigneeId: string | null;
  assignee?: { id: string; name: string };
}

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

const removeTicketFromColumns = (
  columns: BoardColumn[],
  ticketId: string,
): { cleanColumns: BoardColumn[]; extractedTicket: Ticket | undefined } => {
  let extractedTicket: Ticket | undefined;

  const cleanColumns = columns.map((col) => {
    const found = col.tickets.find((t) => t.id === ticketId);
    if (!found) return col;

    extractedTicket = { ...found };
    return {
      ...col,
      tickets: col.tickets.filter((t) => t.id !== ticketId),
    };
  });

  return { cleanColumns, extractedTicket };
};

const insertAndSortTicketInColumn = (
  columns: BoardColumn[],
  ticket: Ticket,
  targetColumnId: string,
  newPosition: number,
): BoardColumn[] => {
  return columns.map((col) => {
    if (col.id !== targetColumnId) return col;

    // On met les nouvelles coordonnées fournies par le réseau
    const updatedTicket = {
      ...ticket,
      columnId: targetColumnId,
      position: newPosition,
    };
    const nextTickets = [...col.tickets, updatedTicket];

    // On trie sur notre base de 1000
    nextTickets.sort((a, b) => a.position - b.position);

    return { ...col, tickets: nextTickets };
  });
};

const addTicketToColumn = (
  columns: BoardColumn[],
  targetColumnId: string,
  newTicket: Ticket,
): BoardColumn[] => {
  return columns.map((col) => {
    if (col.id !== targetColumnId) return col;

    return {
      ...col,
      // Le spread operator (...) permet d'ajouter le ticket sans casser l'immuabilité de React
      tickets: [...col.tickets, newTicket],
    };
  });
};

const deleteTicketFromBoard = (
  columns: BoardColumn[],
  ticketId: string,
): BoardColumn[] => {
  return columns.map((col) => ({
    ...col,
    // On dégage le ticket visuellement en gardant tous ceux qui n'ont pas son ID
    tickets: col.tickets.filter((t) => t.id !== ticketId),
  }));
};

const modifyTicketInBoard = (
  columns: BoardColumn[],
  ticketId: string,
  updates: Partial<Ticket>,
): BoardColumn[] => {
  return columns.map((col) => ({
    ...col,
    // On cherche le ticket ciblé : si c'est lui, on fusionne l'ancien avec les modifs, sinon on n'y touche pas
    tickets: col.tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updates } : t,
    ),
  }));
};

const moveColumnInBoard = (
  columns: BoardColumn[],
  columnId: string,
  newIndex: number,
): BoardColumn[] => {
  const currentOldIndex = columns.findIndex((col) => col.id === columnId);
  if (currentOldIndex === -1) return columns;

  // On utilise arrayMove pour refaire le tableau au propre
  return arrayMove(columns, currentOldIndex, newIndex);
};

export function useKanbanDragAndDrop(
  projectId: string,
  initialColumns: BoardColumn[],
  token: string,
  currentUserRole: string,
  onError?: (message: string) => void,
) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [prevInitialColumns, setPrevInitialColumns] =
    useState<BoardColumn[]>(initialColumns);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);

  const { socket } = useSocket();

  if (initialColumns !== prevInitialColumns) {
    setPrevInitialColumns(initialColumns);
    setColumns(initialColumns);
  }

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_project", { projectId });

    socket.on("column_moved", (payload: ColumnMovedPayload) => {
      if (payload.projectId !== projectId) return;

      setColumns((prevColumns) =>
        moveColumnInBoard(prevColumns, payload.columnId, payload.newIndex),
      );
    });

    socket.on("ticket_moved", (payload: TicketMovedPayload) => {
      if (payload.projectId !== projectId) return;

      setColumns((prevColumns) => {
        // On retire le ticket bougé par le collègue de son ancienne colonne
        const { cleanColumns, extractedTicket } = removeTicketFromColumns(
          prevColumns,
          payload.ticketId,
        );

        if (!extractedTicket) return prevColumns;

        // On injecte le ticket dans la nouvelle colonne et on trie direct pour que l'affichage reste clean
        return insertAndSortTicketInColumn(
          cleanColumns,
          extractedTicket,
          payload.newColumnId,
          payload.newPosition,
        );
      });
    });

    socket.on("ticket_created", (payload: TicketCreatedPayload) => {
      if (payload.projectId !== projectId) return;
      setColumns((prevColumns) =>
        addTicketToColumn(prevColumns, payload.columnId, payload.ticket),
      );
    });

    socket.on("ticket_deleted", (payload: TicketDeletedPayload) => {
      if (payload.projectId !== projectId) return;
      setColumns((prevColumns) =>
        deleteTicketFromBoard(prevColumns, payload.ticketId),
      );
    });

    socket.on("ticket_updated", (payload: TicketUpdatedPayload) => {
      if (payload.projectId !== projectId) return;
      setColumns((prevColumns) =>
        modifyTicketInBoard(prevColumns, payload.ticketId, payload.updates),
      );
    });

    socket.on("ticket_assigned", (payload: TicketAssignedPayload) => {
      if (payload.projectId !== projectId) return;
      // On traite l'assignation comme un simple update local de la clé "assigneeId"
      setColumns((prevColumns) =>
        modifyTicketInBoard(prevColumns, payload.ticketId, {
          assigneeId: payload.assigneeId,
          assignee: payload.assignee,
        }),
      );
    });

    // On nettoie tous les écouteurs quand on quitte la page pour pas faire bugger React avec des events en double
    return () => {
      socket.off("column_moved");
      socket.off("ticket_moved");
      socket.off("ticket_created");
      socket.off("ticket_deleted");
      socket.off("ticket_updated");
      socket.off("ticket_assigned");
    };
  }, [socket, projectId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === "Column") {
      const column = columns.find((c) => c.id === active.id);
      if (column) setActiveColumn(column);
      return;
    }

    for (const column of columns) {
      const ticket = column.tickets.find((t) => t.id === active.id);
      if (ticket) {
        setActiveTicket(ticket);
        return;
      }
    }
  };

  const handleColumnMove = async (activeId: string, overId: string) => {
    // Ici on vérifie si la personne a les bons droits pour réorganiser le tableau
    if (currentUserRole !== "OWNER" && currentUserRole !== "PO") {
      if (onError) {
        onError(
          "Action refusée : Vous n'avez pas les droits pour réorganiser le tableau.",
        );
      }
      return;
    }

    const oldIndex = columns.findIndex((col) => col.id === activeId);
    const newIndex = columns.findIndex((col) => col.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const previousColumns = [...columns];

    // On décale le tableau des colonnes direct pour pas faire attendre l'utilisateur
    const nextColumns = arrayMove(columns, oldIndex, newIndex);
    setColumns(nextColumns);

    const prevCol = nextColumns[newIndex - 1];
    const nextCol = nextColumns[newIndex + 1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newPosition = calculateNewPosition(prevCol as any, nextCol as any);

    try {
      await apiFetch(
        `/columns/${activeId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ position: newPosition }),
        },
        token,
      );

      socket?.emit("move_column", {
        projectId,
        columnId: activeId,
        oldIndex,
        newIndex,
      });
    } catch (error) {
      console.error("Erreur serveur, rollback de la colonne", error);
      setColumns(previousColumns);
    }
  };

  const handleTicketMove = async (ticketId: string, droppedOnId: string) => {
    const { sourceColumnIndex, ticketToMove } = findTicketIndex(
      columns,
      ticketId,
    );

    if (!ticketToMove) return;

    const target = findTargetColumn(columns, droppedOnId);
    if (!target) return;

    const { targetColumnIndex, realTargetColumnId } = target;
    const targetColumn = columns[targetColumnIndex];

    // Ici on vérifie si la colonne est lock et s'il a le bon role pour le mettre dedans
    if (
      targetColumn.isLocked &&
      currentUserRole !== "PO" &&
      currentUserRole !== "OWNER"
    ) {
      if (onError) {
        onError(
          "Action refusée : Seul un PO ou l'owner peut déplacer un ticket dans cette colonne.",
        );
      }
      return;
    }

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

      // Si la db dit oui, on balance l'info en temps réel à toute l'équipe
      socket?.emit("move_ticket", {
        projectId,
        ticketId,
        newColumnId: realTargetColumnId,
        newPosition,
      });
    } catch (error) {
      console.error("[Drag Error]: Le serveur a refusé le déplacement", error);
      setColumns(previousColumns);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTicket(null);
    setActiveColumn(null);
    const { active, over } = event;

    if (!over?.id || active.id === over.id) return;

    // On récupère le type pour savoir si on manipule le board ou une colonne
    const activeType = active.data.current?.type;

    if (activeType === "Column") {
      await handleColumnMove(active.id.toString(), over.id.toString());
    } else {
      await handleTicketMove(active.id.toString(), over.id.toString());
    }
  };

  return {
    columns,
    setColumns,
    activeTicket,
    activeColumn,
    handleDragStart,
    handleDragEnd,
  };
}
