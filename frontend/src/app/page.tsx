import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { apiFetch } from "@/lib/api";

interface Project {
  id: string;
  name: string;
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  let projects: Project[] = [];
  if (session?.access_token) {
    try {
      projects = await apiFetch<Project[]>(
        "/projects",
        { method: "GET" },
        session.access_token,
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black p-4">
      <h1 className="text-4xl font-bold mb-8">Tableau de bord NexTask</h1>

      {!session ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-red-500">Tu n&apos;es pas connecté.</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <div className="flex justify-between items-center mb-8">
            <p className="text-xl">
              Bonjour,{" "}
              <span className="font-bold text-blue-600">
                {session.user?.name}
              </span>
            </p>
            <LogoutButton />
          </div>

          <h2 className="text-2xl font-semibold mb-6">Vos Projets</h2>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${project.id}/board`}
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-bold">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cliquez pour voir le tableau
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              Aucun projet trouvé. Créez-en un premier !
            </div>
          )}
        </div>
      )}
    </div>
  );
}
