export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  projectId: string;
  columnId: string;
  position: number;
  assigneeId: string | null;
  column: {
    isLocked: boolean;
  };
  assignee?: {
    id: string;
    name: string;
  };
}
