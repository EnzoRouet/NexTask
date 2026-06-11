import { BoardColumn } from "./boardColumn";

export interface ProjectMember {
  id: string;
  role: "PO" | "DEVELOPER";
  userId: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;

  ownerId: string;
  owner: {
    id: string;
    name: string;
  };

  members: ProjectMember[];

  columns: BoardColumn[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
