"use client";

import { Project } from "@/types/projects";
import { useState, useRef, useEffect } from "react";
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
import { EditColumnModal } from "./EditColumnModal";
import { useKanbanDragAndDrop } from "@/hooks/useKanbanDrag&Drop";
import { TicketCard } from "./TicketCard";
import { BoardColumn } from "@/types/boardColumn";
import { AlertCircle, X } from "lucide-react";

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
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleError = (message: string) => {
    setErrorMsg(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

    errorTimeoutRef.current = setTimeout(() => {
      setErrorMsg(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

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
  } = useKanbanDragAndDrop(
    project.id,
    project.columns,
    token,
    projectRole,
    handleError,
  );

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

      <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start relative">
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
                onEditClick={setEditingColumn}
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
                  onEditClick={() => {}}
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

      <EditColumnModal
        key={editingColumn?.id || "empty-edit-modal"}
        isOpen={!!editingColumn}
        onClose={() => setEditingColumn(null)}
        column={editingColumn}
        token={token}
        onSuccess={(updatedColumn) => {
          setColumns(
            columns.map((col) =>
              col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col,
            ),
          );
        }}
      />

      {errorMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-lg shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-2 p-1 rounded-md hover:bg-red-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
