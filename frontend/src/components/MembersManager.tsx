"use client";

import { useState } from "react";
import { Users, X, Loader2, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  role?: string;
  user: {
    id: string;
    name: string;
  };
}

interface MembersManagerProps {
  projectId: string;
  members: Member[];
  token: string;
  currentUserRole: string;
}

export function MembersManager({
  projectId,
  members,
  token,
  currentUserRole,
}: Readonly<MembersManagerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const canManageRoles =
    currentUserRole === "OWNER" || currentUserRole === "PO";

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      await apiFetch(
        `/projects/${projectId}/members/${targetUserId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        },
        token,
      );
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Impossible de modifier le rôle.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m, i) => (
            <div
              key={m.user.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white z-[${3 - i}] ${
                i === 0
                  ? "bg-blue-600"
                  : i === 1
                    ? "bg-indigo-500"
                    : "bg-teal-500"
              }`}
            >
              {m.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white z-0">
              +{members.length - 3}
            </div>
          )}
        </div>
        <Users className="w-4 h-4 text-gray-500 ml-1" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Membres du projet
                </h2>
                <p className="text-sm text-gray-500">
                  {members.length} participants
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {members.map((member) => {
                const isOwner = member.role === "OWNER";
                return (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {member.user.name.replace(" (Créateur)", "")}
                          {isOwner && (
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isOwner ? "Propriétaire" : "Membre invité"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {updatingId === member.user.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}

                      {isOwner ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          OWNER
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          disabled={
                            !canManageRoles || updatingId === member.user.id
                          }
                          onChange={(e) =>
                            handleRoleChange(member.user.id, e.target.value)
                          }
                          className={`text-sm px-2 py-1 rounded-md border outline-none ${
                            !canManageRoles
                              ? "bg-gray-50 text-gray-500 border-transparent cursor-not-allowed"
                              : "bg-white border-gray-200 focus:border-blue-500 cursor-pointer"
                          }`}
                        >
                          <option value="DEVELOPER">Developer</option>
                          <option value="PO">Product Owner</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
