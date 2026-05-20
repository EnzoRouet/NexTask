import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";

export type TicketStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: Priority;
}

// On crée un mock de test
const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Configurer la base Prisma",
    description: "Créer les modèles User et Ticket",
    status: "DONE",
    priority: "HIGH",
  },
  {
    id: "2",
    title: "Créer le layout du Board",
    description: "Utiliser Tailwind et Flexbox",
    status: "DONE",
    priority: "MEDIUM",
  },
  {
    id: "3",
    title: "Implémenter le Kanban",
    description: "Gérer l'état des colonnes",
    status: "IN_PROGRESS",
    priority: "HIGH",
  },
  {
    id: "4",
    title: "Ajouter le Drag & Drop",
    description: "Utiliser dnd-kit",
    status: "TODO",
    priority: "LOW",
  },
];

export default async function BoardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const tickets = mockTickets;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sprint Actuel</h2>
        <p className="text-gray-500">
          Gérez vos tickets en les déplaçant dans les colonnes.
        </p>
      </div>

      <div className="p-4 text-yellow-800 rounded">
        <KanbanBoard initialTickets={tickets} />
      </div>
    </div>
  );
}
