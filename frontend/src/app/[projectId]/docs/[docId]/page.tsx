import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DocDetails } from "@/types/documentation";
import { Project } from "@/types/projects";
import { DocumentationEditor } from "@/components/wiki/DocumentationEditor";
import { DeleteDocButton } from "@/components/wiki/DeleteDocButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditorPageProps {
  params: Promise<{ projectId: string; docId: string }>;
}

export default async function EditorPage({
  params,
}: Readonly<EditorPageProps>) {
  const session = await getServerSession(authOptions);
  if (!session?.access_token) {
    redirect("/login");
  }

  const { docId, projectId } = await params;

  const [document, project] = await Promise.all([
    apiFetch<DocDetails>(
      `/documentation/${docId}`,
      { method: "GET" },
      session.access_token,
    ),
    apiFetch<Project>(
      `/projects/${projectId}`,
      { method: "GET" },
      session.access_token,
    ),
  ]);

  let currentUserRole = "DEVELOPER";
  if (project.ownerId === session.user.id) {
    currentUserRole = "OWNER";
  } else {
    const member = project.members?.find((m) => m.userId === session.user.id);
    if (member) currentUserRole = member.role;
  }

  const canDelete = currentUserRole === "PO" || currentUserRole === "OWNER";

  const handleSave = async (data: { title: string; content: string }) => {
    "use server";
    const serverSession = await getServerSession(authOptions);
    if (!serverSession?.access_token) throw new Error("Non autorisé");

    await apiFetch(
      `/documentation/${docId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title: data.title,
          content: data.content,
        }),
      },
      serverSession.access_token,
    );
  };

  return (
    <div className="min-h-full bg-background text-text-main p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link
          href={`/${projectId}/docs`}
          className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Retour au Wiki
        </Link>

        {canDelete && (
          <DeleteDocButton
            projectId={projectId}
            docId={docId}
            token={session.access_token}
          />
        )}
      </div>

      <DocumentationEditor
        initialTitle={document.title}
        initialContent={document.content || ""}
        onSave={handleSave}
      />
    </div>
  );
}
