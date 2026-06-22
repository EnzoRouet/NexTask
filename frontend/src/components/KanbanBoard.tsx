"use client";

import { Project } from "@/types/projects";
import { useState, useEffect } from "react";
import KanbanColumn from "./KanbanColumn";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { CreateTicketModal } from "./CreateTicketModal";
import { CreateColumnModal } from "./CreateColumnModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { Ticket } from "@/types/tickets";
import { TicketDetailsModal } from "./TicketDetailsModal";
import { useKanbanDragAndDrop } from "@/hooks/useKanbanDrag&Drop";
import { TicketCard } from "./TicketCard";
import { useSocket } from "@/providers/socket.provider"; // 👈 Ton import magique

export interface User {
  id: string;
  role: "USER" | "ADMIN";
}

interface TicketMovedPayload {
  projectId: string;
  ticketId: string;
  newColumnId: string;
  newPosition: number;
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // 1. Récupération de la socket globale
  const { socket } = useSocket();

  const isOwner = project.ownerId === user.id;
  const currentMember = project.members?.find((m) => m.userId === user.id);
  const projectRole = isOwner ? "OWNER" : currentMember?.role || "DEVELOPER";

  const { columns, setColumns, handleDragEnd } = useKanbanDragAndDrop(
    project.id,
    project.columns,
    token,
    projectRole,
  );

  // 2. Gestion de l'écoute temps réel (Flux descendant)
  useEffect(() => {
    if (!socket) return;

    // On rejoint la Room spécifique à ce projet
    socket.emit("join_project", { projectId: project.id });

    // On écoute les mouvements faits par les collaborateurs
    socket.on("ticket_moved", (payload: TicketMovedPayload) => {
      if (payload.projectId !== project.id) return;

      setColumns((prevColumns) => {
        let ticketToMove: Ticket | undefined;

        // Étape A : Extraire le ticket de son ancienne colonne
        const updatedColumns = prevColumns.map((col) => {
          const foundTicket = col.tickets.find(
            (t) => t.id === payload.ticketId,
          );
          if (foundTicket) {
            ticketToMove = foundTicket;
            return {
              ...col,
              tickets: col.tickets.filter((t) => t.id !== payload.ticketId),
            };
          }
          return col;
        });

        if (!ticketToMove) return prevColumns; // Sécurité si le ticket n'existe pas localement

        // Étape B : Insérer le ticket dans sa nouvelle colonne à la bonne position
        return updatedColumns.map((col) => {
          if (col.id === payload.newColumnId) {
            const nextTickets = [...col.tickets];
            const targetIndex = Math.min(
              payload.newPosition,
              nextTickets.length,
            );
            nextTickets.splice(targetIndex, 0, ticketToMove!);
            return { ...col, tickets: nextTickets };
          }
          return col;
        });
      });
    });

    // Nettoyage impératif de l'écouteur au démontage du composant
    return () => {
      socket.off("ticket_moved");
    };
  }, [socket, project.id, setColumns]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStart = (event: any) => {
    const { active } = event;
    const activeId = active.id;

    for (const column of columns) {
      const ticket = column.tickets.find((t) => t.id === activeId);
      if (ticket) {
        setActiveTicket(ticket);
        return;
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDragEndWrapper = (event: any) => {
    setActiveTicket(null);

    // On laisse ton hook faire la mise à jour locale et l'appel API HTTP
    handleDragEnd(event);

    // 3. Notification au reste du monde (Flux ascendant)
    const { active, over } = event;
    if (!over || !socket) return;

    const ticketId = active.id as string;

    // Détermination de la colonne de destination et de la position de destination
    // Suivant la structure de ton hook, on cherche où a atterri le ticket
    let destinationColumnId = over.id as string;
    let destinationIndex = 0;

    // Si on survole un autre ticket plutôt qu'une colonne vide, on extrait l'ID de sa colonne parente
    for (const col of columns) {
      const ticketIdx = col.tickets.findIndex((t) => t.id === over.id);
      if (ticketIdx !== -1) {
        destinationColumnId = col.id;
        destinationIndex = ticketIdx;
        break;
      }
    }

    // Si on a survolé directement une colonne, le ticket se place souvent à la fin
    const targetCol = columns.find((c) => c.id === destinationColumnId);
    if (targetCol && over.id === destinationColumnId) {
      destinationIndex = targetCol.tickets.length;
    }

    // On émet l'information vers le serveur NestJS
    socket.emit("move_ticket", {
      projectId: project.id,
      ticketId,
      newColumnId: destinationColumnId,
      newPosition: destinationIndex,
    });
  };

  return (
    <>
      {/* ... Le reste de ton JSX (boutons, DndContext, modales) reste strictement identique ... */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          + Nouveau Ticket
        </button>

        <button
          onClick={() => setIsCreateColumnModalOpen(true)}
          className="bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-900 transition-colors"
        >
          + Nouvelle Colonne
        </button>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
        >
          + Inviter un membre
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={onDragEndWrapper}
          id="kanban-board"
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              token={token}
              user={user}
              onTicketClick={setSelectedTicket}
            />
          ))}

          <DragOverlay>
            {activeTicket ? (
              <TicketCard
                ticket={activeTicket}
                token={token}
                currentUser={user}
                onTicketClick={() => {}}
              />
            ) : null}
          </DragOverlay>
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

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={project.id}
        token={token}
      />

      <TicketDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        token={token}
      />
    </>
  );
}
