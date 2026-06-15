import React from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: Readonly<ProjectLayoutProps>) {
  const { projectId } = await params;

  return (
    <div className="flex h-screen w-full bg-gray-100 text-black">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-10 tracking-tight">
          Nex<span className="text-green-400">Task</span>
        </h1>

        <nav className="flex-1 space-y-2">
          <Link
            href="/"
            className="block p-3 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-400"
          >
            ← Mes projets
          </Link>

          <div className="pt-6 pb-2 text-xs uppercase text-gray-500 font-semibold tracking-wider">
            Espace de travail
          </div>

          <Link
            href={`/${projectId}/board`}
            className="block p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kanban
          </Link>

          <Link
            href={`/${projectId}/docs`}
            className="block p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Documentation
          </Link>

          <div className="pt-6 pb-2 text-xs uppercase text-gray-500 font-semibold tracking-wider border-t border-gray-800 mt-6">
            Compte
          </div>

          <div className="p-3 rounded-lg hover:bg-gray-800 transition-colors mt-2">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
