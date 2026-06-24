"use client";

import { Project } from "@/types/projects";
import { useState } from "react";
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

  const isOwner = project.ownerId === user.id;
  const currentMember = project.members?.find((m) => m.userId === user.id);
  const projectRole = isOwner ? "OWNER" : currentMember?.role || "DEVELOPER";

  const { columns, setColumns, handleDragEnd } = useKanbanDragAndDrop(
    project.id,
    project.columns,
    token,
    projectRole,
  );

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

  return (
    <>
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
          onDragEnd={(event) => {
            setActiveTicket(null);
            handleDragEnd(event);
          }}
          id="kanban-board"
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              token={token}
              user={user}
              projectRole={projectRole}
              onTicketClick={setSelectedTicket}
            />
          ))}

          <DragOverlay>
            {activeTicket ? (
              <TicketCard
                ticket={activeTicket}
                token={token}
                currentUser={user}
                projectRole={projectRole}
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
        columnId={columns[0]?.id || ""}
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
