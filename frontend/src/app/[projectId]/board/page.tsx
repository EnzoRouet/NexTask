import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import { apiFetch } from "@/lib/api";
import { Project } from "@/types/projects";

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
  console.log(session.access_token);

  const { projectId } = await params;

  const project = await apiFetch<Project>(
    `/projects/${projectId}`,
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
          project={project}
          token={session.access_token}
          user={session.user}
        />
      </div>
    </div>
  );
}
