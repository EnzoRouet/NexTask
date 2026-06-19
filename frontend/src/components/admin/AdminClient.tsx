"use client";

import { useState } from "react";
import AdminUsersTab from "./AdminUsersTable";
import AdminProjectsTab from "./AdminProjectsTable";

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
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-neutral-800 pb-4">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
            activeTab === "USERS"
              ? "text-white border-b-2 border-blue-500"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
            activeTab === "PROJECTS"
              ? "text-white border-b-2 border-blue-500"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Projets & Modération
        </button>
      </div>

      {activeTab === "USERS" && (
        <AdminUsersTab token={token} currentUserId={currentUserId} />
      )}

      {activeTab === "PROJECTS" && (
        <AdminProjectsTab token={token} currentUserId={currentUserId} />
      )}
    </div>
  );
}
