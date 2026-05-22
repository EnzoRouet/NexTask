import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import { apiFetch } from "@/lib/api";

export type TicketStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: Priority;
}

export default async function BoardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    redirect("/login");
  }

  const tickets = await apiFetch<Ticket[]>(
    "/tickets",
    { method: "GET" },
    session.access_token,
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sprint Actuel</h2>
        <p className="text-gray-500">
          Gérez vos tickets en les déplaçant dans les colonnes.
        </p>
      </div>

      <div className="p-4 text-yellow-800 rounded">
        <KanbanBoard initialTickets={tickets} token={session.access_token} />
      </div>
    </div>
  );
}
