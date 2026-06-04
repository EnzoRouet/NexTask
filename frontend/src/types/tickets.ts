export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  projectId: string;
  columnId: string;
  position: number;
}
