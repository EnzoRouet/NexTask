"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

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

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const data = await apiFetch<ProjectAdmin[]>(
          "/admin/projects",
          {},
          token,
        );
        if (isMounted) {
          setProjects(data);
        }
      } catch {
        if (isMounted) {
          setMessage({
            text: "Erreur lors du chargement des projets.",
            type: "error",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
        text: "Droits accordés ! Vous pouvez consulter ce projet via le Board.",
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

  const handleSuspend = async (projectId: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir suspendre ce projet ? Il sera rendu invisible pour toute l'équipe.",
      )
    ) {
      return;
    }

    try {
      await apiFetch(
        `/admin/projects/${projectId}/suspend`,
        { method: "PATCH" },
        token,
      );
      setMessage({ text: "Le projet a été suspendu.", type: "success" });

      setRefreshTrigger((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({
        text: error.message || "Erreur lors de la suspension",
        type: "error",
      });
    }
  };

  if (isLoading)
    return <div className="text-neutral-400">Scan des projets en cours...</div>;

  return (
    <div className="space-y-4">
      {message.text && (
        <div
          className={`p-3 rounded text-sm text-center ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[#151921] rounded-lg border border-neutral-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#0D1016] border-b border-neutral-800 text-neutral-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Projet</th>
              <th className="px-6 py-4">Propriétaire</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions de Modération</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-neutral-200">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-neutral-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{project.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {project._count.members} membre(s) •{" "}
                    {project._count.tickets} ticket(s)
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{project.owner.name}</p>
                  <p className="text-xs text-neutral-500">
                    {project.owner.email}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {project.deletedAt ? (
                    <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded">
                      Suspendu
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold rounded">
                      Actif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleInvestigate(project.id)}
                    className="px-3 py-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white border border-blue-600/30 text-xs font-bold rounded transition-all"
                  >
                    Enquêter
                  </button>
                  {!project.deletedAt && (
                    <button
                      onClick={() => handleSuspend(project.id)}
                      className="px-3 py-1.5 bg-transparent hover:bg-red-600/20 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-600/30 text-xs font-bold rounded transition-all"
                    >
                      Suspendre
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
