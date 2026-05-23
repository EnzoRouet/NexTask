import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import { apiFetch } from "@/lib/api";
import { Ticket } from "@/types/tickets";

interface BoardPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function BoardPage({ params }: Readonly<BoardPageProps>) {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    redirect("/login");
  }

  const { projectId } = await params;

  const tickets = await apiFetch<Ticket[]>(
    `/tickets?projectId=${projectId}`,
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
        <KanbanBoard
          initialTickets={tickets}
          token={session.access_token}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
