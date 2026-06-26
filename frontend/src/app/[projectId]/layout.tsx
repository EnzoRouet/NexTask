import React from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Settings } from "lucide-react";

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
    <div className="flex h-screen w-full bg-transparent text-text-main">
      <aside className="w-64 bg-surface border-r border-border-dim flex flex-col p-6 z-10">
        <h1 className="text-2xl font-bold mb-10 tracking-tight">
          Nex<span className="text-accent">Task</span>
        </h1>

        <nav className="flex-1 space-y-2">
          <Link
            href="/"
            className="block p-3 rounded-md hover:bg-surface-hover transition-colors text-sm text-text-muted hover:text-text-main"
          >
            ← Mes projets
          </Link>

          <div className="pt-6 pb-2 text-xs uppercase text-text-muted opacity-70 font-semibold tracking-wider">
            Espace de travail
          </div>

          <Link
            href={`/${projectId}/board`}
            className="block p-3 rounded-md hover:bg-surface-hover transition-colors text-sm font-medium"
          >
            Kanban
          </Link>

          <Link
            href={`/${projectId}/docs`}
            className="block p-3 rounded-md hover:bg-surface-hover transition-colors text-sm font-medium text-text-muted hover:text-text-main"
          >
            Documentation
          </Link>

          <div className="pt-6 pb-2 text-xs uppercase text-text-muted opacity-70 font-semibold tracking-wider border-t border-border-dim mt-6">
            Compte
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-2 p-3 rounded-md hover:bg-surface-hover transition-colors text-sm font-medium text-text-muted hover:text-text-main mt-2"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </Link>

          <div className="p-3 rounded-md hover:bg-surface-hover transition-colors">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-transparent">
        {children}
      </main>
    </div>
  );
}
