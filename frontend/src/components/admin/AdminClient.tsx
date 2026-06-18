"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import UserDetailModal from "./UserDetailModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AdminClientProps {
  token: string;
  currentUserId: string;
}

export default function AdminClient({
  token,
  currentUserId,
}: Readonly<AdminClientProps>) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const data = await apiFetch<User[]>("/admin", {}, token);
        if (isMounted) {
          setUsers(data);
        }
      } catch {
        console.error("Erreur de récupération des utilisateurs");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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

  if (isLoading)
    return <div className="text-neutral-400">Chargement des systèmes...</div>;

  return (
    <>
      <div className="bg-[#151921] rounded-lg border border-neutral-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-[#0D1016] border-b border-neutral-800 text-neutral-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 text-right">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-neutral-200">
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-neutral-400">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${user.role === "ADMIN" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
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
