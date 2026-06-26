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
      <div className="flex gap-3 mb-8 flex-wrap items-center">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-accent text-white px-3.5 py-1.5 text-sm font-medium rounded-md shadow-sm transition-all hover:opacity-90 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none mb-0.5">+</span> Nouveau Ticket
        </button>

        <button
          onClick={() => setIsCreateColumnModalOpen(true)}
          className="bg-surface border border-border-dim text-text-main px-3.5 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-surface-hover hover:border-border-focus flex items-center gap-1.5"
        >
          <span className="text-lg leading-none mb-0.5 text-text-muted">+</span>{" "}
          Nouvelle Colonne
        </button>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-surface border border-border-dim text-text-main px-3.5 py-1.5 text-sm font-medium rounded-md transition-all hover:bg-surface-hover hover:border-border-focus flex items-center gap-1.5 ml-auto"
        >
          <span className="text-lg leading-none mb-0.5 text-text-muted">+</span>{" "}
          Inviter un membre
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
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
              <div className="rotate-2 opacity-90 shadow-2xl cursor-grabbing">
                <TicketCard
                  ticket={activeTicket}
                  token={token}
                  currentUser={user}
                  projectRole={projectRole}
                  onTicketClick={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* MODALES */}
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
