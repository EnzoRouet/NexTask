import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import { apiFetch } from "@/lib/api";
import { Project } from "@/types/projects";
import { MembersManager } from "@/components/MembersManager";

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

  const project = await apiFetch<Project>(
    `/projects/${projectId}`,
    { method: "GET" },
    session.access_token,
  );

  let currentUserRole = "DEVELOPER";
  if (project.ownerId === session.user.id) {
    currentUserRole = "OWNER";
  } else {
    const memberRecord = project.members?.find(
      (m) => m.userId === session.user.id,
    );
    if (memberRecord) {
      currentUserRole = memberRecord.role;
    }
  }

  const formattedMembers = [
    {
      id: `owner-${project.owner.id}`,
      role: "OWNER",
      user: { id: project.owner.id, name: project.owner.name },
    },
    ...(project.members?.map((m) => ({
      id: m.id,
      role: m.role,
      user: { id: m.user.id, name: m.user.name },
    })) || []),
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Sprint Actuel</h2>
          <p className="text-gray-500">
            Gérez vos tickets en les déplaçant dans les colonnes.
          </p>
        </div>

        <MembersManager
          projectId={project.id}
          members={formattedMembers}
          token={session.access_token}
          currentUserRole={currentUserRole}
        />
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
