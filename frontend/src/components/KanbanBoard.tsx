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
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  // On configure les capteurs pour éviter que le drag ne s'active au moindre clic
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

  const isOwner = project.ownerId === user.id;
  const currentMember = project.members?.find((m) => m.userId === user.id);
  const projectRole = isOwner ? "OWNER" : currentMember?.role || "DEVELOPER";

  const {
    columns,
    setColumns,
    activeTicket,
    activeColumn,
    handleDragStart,
    handleDragEnd,
  } = useKanbanDragAndDrop(project.id, project.columns, token, projectRole);

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

      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          id="kanban-board"
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
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
          </SortableContext>

          <DragOverlay>
            {activeColumn ? (
              <div className="rotate-2 opacity-80 scale-105 shadow-2xl cursor-grabbing transition-transform">
                <KanbanColumn
                  column={activeColumn}
                  token={token}
                  user={user}
                  projectRole={projectRole}
                  onTicketClick={() => {}}
                />
              </div>
            ) : null}

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
