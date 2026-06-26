"use client";

import { useState } from "react";
import AdminUsersTab from "./AdminUsersTable";
import AdminProjectsTab from "./AdminProjectsTable";
import { Users, FolderKanban } from "lucide-react";

interface AdminClientProps {
  token: string;
  currentUserId: string;
}

export default function AdminClient({
  token,
  currentUserId,
}: Readonly<AdminClientProps>) {
  const [activeTab, setActiveTab] = useState<"USERS" | "PROJECTS">("USERS");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border-dim pb-px">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative ${
            activeTab === "USERS"
              ? "text-accent"
              : "text-text-muted hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Utilisateurs
          {activeTab === "USERS" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative ${
            activeTab === "PROJECTS"
              ? "text-accent"
              : "text-text-muted hover:text-white"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Projets & Modération
          {activeTab === "PROJECTS" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]" />
          )}
        </button>
      </div>

      <div className="mt-2">
        {activeTab === "USERS" && (
          <AdminUsersTab token={token} currentUserId={currentUserId} />
        )}
        {activeTab === "PROJECTS" && (
          <AdminProjectsTab token={token} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
