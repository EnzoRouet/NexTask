import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminClient from "../../components/admin/AdminClient";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    redirect("/login");
  }

  if (session?.user.role !== "ADMIN") {
    redirect("/board");
  }

  return (
    <div className="min-h-screen bg-background text-text-main p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 mt-4">
        <header className="border-b border-border-dim pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Centre de Contrôle
              </h1>
            </div>
            <p className="text-sm text-text-muted mt-2 font-medium">
              Supervision globale, gestion des accès et modération des projets.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-dim rounded-lg hover:bg-surface-hover hover:border-border-focus transition-colors"
          >
            Retour à l&apos;application
          </Link>
        </header>

        <main>
          <AdminClient
            token={session.access_token}
            currentUserId={session.user.id}
          />
        </main>
      </div>
    </div>
  );
}
