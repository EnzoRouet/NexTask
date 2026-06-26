"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import UserDetailModal from "./UserDetailModal";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AdminUsersTabProps {
  token: string;
  currentUserId: string;
}

export default function AdminUsersTab({
  token,
  currentUserId,
}: Readonly<AdminUsersTabProps>) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const data = await apiFetch<User[]>("/admin/users", {}, token);
        if (isMounted) setUsers(data);
      } catch {
        console.error("Erreur de récupération des utilisateurs");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [token, refreshTrigger]);

  const handleUserUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-text-muted gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-accent" /> Chargement des
        profils...
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-xl border border-border-dim overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/2 border-b border-border-dim">
            <tr>
              <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Identité
              </th>
              <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">
                Rôle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim">
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className="hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-text-muted font-mono">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === "ADMIN"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-accent/10 text-accent border-accent/20"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          token={token}
          currentUserId={currentUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={handleUserUpdated}
        />
      )}
    </>
  );
}
