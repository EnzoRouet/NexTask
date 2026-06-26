"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Loader2, Search, AlertCircle } from "lucide-react";

interface ProjectAdmin {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  deletedAt: string | null;
  owner: { name: string; email: string };
  _count: { members: number; tickets: number };
}

interface AdminProjectsTableProps {
  token: string;
  currentUserId: string;
}

export default function AdminProjectsTable({
  token,
}: Readonly<AdminProjectsTableProps>) {
  const [projects, setProjects] = useState<ProjectAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectToSuspend, setProjectToSuspend] = useState<ProjectAdmin | null>(
    null,
  );
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const data = await apiFetch<ProjectAdmin[]>(
          "/admin/projects",
          {},
          token,
        );
        if (isMounted) setProjects(data);
      } catch {
        if (isMounted)
          setMessage({
            text: "Erreur lors du chargement des projets.",
            type: "error",
          });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [token, refreshTrigger]);

  const handleInvestigate = async (projectId: string) => {
    try {
      await apiFetch(
        `/admin/projects/${projectId}/investigate`,
        { method: "POST" },
        token,
      );
      setMessage({
        text: "Droits accordés ! Vous pouvez consulter ce projet.",
        type: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({
        text: error.message || "Erreur lors de l'investigation",
        type: "error",
      });
    }
  };

  const executeSuspend = async () => {
    if (!projectToSuspend) return;
    setIsSuspending(true);
    try {
      await apiFetch(
        `/admin/projects/${projectToSuspend.id}/suspend`,
        { method: "PATCH" },
        token,
      );
      setMessage({ text: "Le projet a été suspendu.", type: "success" });
      setRefreshTrigger((prev) => prev + 1);
      setProjectToSuspend(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({
        text: error.message || "Erreur lors de la suspension",
        type: "error",
      });
    } finally {
      setIsSuspending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-text-muted gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-accent" /> Scan de la base
        de données...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {message.text && (
          <div
            className={`p-4 rounded-lg text-sm flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {message.text}
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border-dim overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/2 border-b border-border-dim">
              <tr>
                <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-surface-hover transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm">
                      {project.name}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-mono">
                      {project._count.members} users • {project._count.tickets}{" "}
                      tickets
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-text-main">
                      {project.owner.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {project.owner.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {project.deletedAt ? (
                      <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Suspendu
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleInvestigate(project.id)}
                        className="px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" /> Enquêter
                      </button>
                      {!project.deletedAt && (
                        <button
                          onClick={() => setProjectToSuspend(project)}
                          className="px-3 py-1.5 bg-transparent hover:bg-red-500/10 text-text-muted hover:text-red-400 border border-transparent hover:border-red-500/20 text-xs font-bold rounded-md transition-all"
                        >
                          Suspendre
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={projectToSuspend !== null}
        onClose={() => setProjectToSuspend(null)}
        onConfirm={executeSuspend}
        title="Suspendre le projet"
        description={`Êtes-vous sûr de vouloir suspendre le projet "${projectToSuspend?.name}" ? Il sera rendu totalement invisible et inaccessible pour toute son équipe.`}
        confirmText="Suspendre le projet"
        isLoading={isSuspending}
        isDestructive={true}
      />
    </>
  );
}
