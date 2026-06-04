import { Ticket } from "./tickets";

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  tickets: Ticket[];
}
