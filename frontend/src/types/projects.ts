import { BoardColumn } from "./boardColumn";

export interface Project {
  id: string;
  name: string;
  description?: string;
  columns: BoardColumn[];
}
