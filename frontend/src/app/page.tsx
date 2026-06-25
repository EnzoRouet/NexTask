import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { apiFetch } from "@/lib/api";
import { NewProjectButton } from "@/components/NewProjectButton";
import { Shield, ArrowRight, FolderKanban } from "lucide-react";

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
    <div className="min-h-screen bg-background text-text-main font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 mt-4">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border-dim gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Nex<span className="text-accent">Task</span>
            </h1>
            {session && (
              <p className="text-sm text-text-muted mt-2">
                Bonjour,{" "}
                <span className="font-semibold text-text-main">
                  {session.user?.name}
                </span>
              </p>
            )}
          </div>
          {session && (
            <div className="flex items-center gap-4">
              {session.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-dim hover:bg-surface-hover hover:border-border-focus text-text-muted hover:text-text-main text-xs font-semibold rounded-md transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Administration
                </Link>
              )}
              <LogoutButton />
            </div>
          )}
        </header>

        {!session ? (
          <div className="flex flex-col items-center justify-center p-12 bg-surface border border-border-dim rounded-xl text-center">
            <p className="text-text-muted font-medium">
              Tu n&apos;es pas connecté.
            </p>
          </div>
        ) : (
          <main className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Espace de travail
              </h2>
              <NewProjectButton token={session.access_token ?? ""} />
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/${project.id}/board`}
                    className="group relative flex flex-col justify-between p-6 h-44 bg-surface border border-border-dim rounded-xl hover:border-border-focus hover:bg-surface-hover transition-all duration-300 ease-out shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                        {project.name}
                      </h3>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-accent/20 transition-colors shrink-0">
                        <FolderKanban className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-dim">
                      <span className="text-xs font-medium text-text-muted group-hover:text-text-main transition-colors">
                        Ouvrir le tableau
                      </span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border-dim rounded-xl bg-transparent text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-surface border border-border-dim flex items-center justify-center">
                  <FolderKanban className="w-8 h-8 text-text-muted opacity-50" />
                </div>
                <p className="text-lg text-text-main font-medium">
                  Aucun projet actif
                </p>
                <p className="text-sm text-text-muted mt-1 max-w-sm">
                  C&apos;est bien vide ici. Créez votre premier projet pour
                  commencer à organiser vos tâches.
                </p>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
