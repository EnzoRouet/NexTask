import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { DocSummary } from "@/types/documentation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateDocButton } from "@/components/wiki/CreateDocButton";

export default async function DocsListPage({
  params,
}: Readonly<{
  params: Promise<{ projectId: string }>;
}>) {
  const session = await getServerSession(authOptions);
  if (!session?.access_token) {
    redirect("/login");
  }

  const { projectId } = await params;

  const docs: DocSummary[] = await apiFetch(
    `/documentation/all/${projectId}`,
    { method: "GET" },
    session.access_token,
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Wiki du Projet</h1>
        <CreateDocButton projectId={projectId} token={session.access_token} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            href={`/${projectId}/docs/${doc.id}`}
            className="block p-6 bg-gray-300 border border-gray-300 rounded-xl hover:border-gray- transition"
          >
            <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
            <p className="text-sm text-gray-500">
              Modifié le {new Date(doc.updatedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
