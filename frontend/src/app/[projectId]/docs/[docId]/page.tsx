import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { DocDetails } from "@/types/documentation";
import { DocumentationEditor } from "@/components/wiki/DocumentationEditor";
import { DeleteDocButton } from "@/components/wiki/DeleteDocButton";
import Link from "next/link";

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

  const document = await apiFetch<DocDetails>(
    `/documentation/${docId}`,
    { method: "GET" },
    session.access_token,
  );

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
    <div className="min-h-[calc(100vh)] -m-8 p-12 bg-[#242124] text-gray-200">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link
          href={`/${projectId}/docs`}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2"
        >
          <span>←</span> Retour au Wiki
        </Link>

        <DeleteDocButton
          projectId={projectId}
          docId={docId}
          token={session.access_token}
        />
      </div>

      <DocumentationEditor
        initialTitle={document.title}
        initialContent={document.content || ""}
        onSave={handleSave}
      />
    </div>
  );
}
