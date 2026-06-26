import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { DocSummary } from "@/types/documentation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateDocButton } from "@/components/wiki/CreateDocButton";
import { FileText, ChevronRight } from "lucide-react";

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
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Wiki du Projet
          </h1>
          <p className="text-sm text-text-muted mt-2">
            Gérez la documentation technique et les spécifications.
          </p>
        </div>
        <CreateDocButton projectId={projectId} token={session.access_token} />
      </div>

      {docs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/${projectId}/docs/${doc.id}`}
              className="group flex flex-col justify-between p-6 h-40 bg-surface border border-border-dim rounded-xl hover:border-border-focus hover:bg-surface-hover transition-all shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-accent/20 transition-colors shrink-0">
                  <FileText className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                </div>
                <h2 className="text-lg font-semibold text-white group-hover:text-accent transition-colors line-clamp-2">
                  {doc.title}
                </h2>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-dim">
                <p className="text-xs text-text-muted font-medium">
                  Modifié le {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border-dim rounded-xl bg-transparent text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-surface border border-border-dim flex items-center justify-center">
            <FileText className="w-8 h-8 text-text-muted opacity-50" />
          </div>
          <p className="text-lg text-text-main font-medium">Aucun document</p>
          <p className="text-sm text-text-muted mt-1 max-w-sm">
            Commencez à rédiger vos spécifications ou vos notes
            d&apos;architecture ici.
          </p>
        </div>
      )}
    </div>
  );
}
