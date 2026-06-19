import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminClient from "../../components/admin/AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.access_token) {
    redirect("/login");
  }

  if (session?.user.role !== "ADMIN") {
    redirect("/board");
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-neutral-200 p-8 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-neutral-800/80 pb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white to-neutral-500 tracking-tight">
            Centre de Contrôle
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">
            Supervision globale, gestion des accès et modération des projets.
          </p>
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
