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
    <div className="min-h-screen bg-[#0D1016] text-neutral-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">
          Centre de Contrôle
        </h1>
        <AdminClient
          token={session.access_token}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
