import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { apiFetch } from "@/lib/api";
import { NewProjectButton } from "@/components/NewProjectButton";

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
    <div className="min-h-screen bg-gray-50 text-black font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Nex<span className="text-blue-600">Task</span>
            </h1>
            {session && (
              <p className="text-lg text-gray-600 mt-2">
                Bonjour,{" "}
                <span className="font-bold text-blue-600 tracking-wide">
                  {session.user?.name}
                </span>
              </p>
            )}
          </div>
          {session && <LogoutButton />}
        </header>

        {!session ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white shadow-md rounded-lg text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-lg text-red-500 font-medium">
              Tu n&apos;es pas connecté.
            </p>
          </div>
        ) : (
          <main className="flex flex-col gap-8 bg-white p-8 rounded-lg shadow-md w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Vos Projets
              </h2>
              <NewProjectButton token={session.access_token ?? ""} />
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/${project.id}`}
                    className="group relative flex flex-col justify-between p-6 h-40 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-300 ease-out"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                        Cliquez pour voir le tableau
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Aucun projet trouvé
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Créez-en un premier pour commencer !
                </p>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
