"use client";

import { useState } from "react";
import { Users, X, Loader2, ShieldAlert, UserMinus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getAvatarColor, getInitials } from "@/lib/color";
import { ConfirmModal } from "./ConfirmModal";

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
  currentUserId: string;
}

export function MembersManager({
  projectId,
  members,
  token,
  currentUserRole,
  currentUserId,
}: Readonly<MembersManagerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [memberToKick, setMemberToKick] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const router = useRouter();

  const canManageRoles =
    currentUserRole === "OWNER" || currentUserRole === "PO";
  const roleWeights: Record<string, number> = { OWNER: 3, PO: 2, DEVELOPER: 1 };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      await apiFetch(
        `/projects/${projectId}/members/${targetUserId}`,
        { method: "PATCH", body: JSON.stringify({ role: newRole }) },
        token,
      );
      router.refresh();
    } catch (error) {
      console.error("Erreur :", error);
      alert("Impossible de modifier le rôle.");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeRemoveMember = async () => {
    if (!memberToKick) return;

    setRemovingId(memberToKick.id);
    try {
      await apiFetch(
        `/projects/${projectId}/members/${memberToKick.id}`,
        { method: "DELETE" },
        token,
      );
      router.refresh();
      setMemberToKick(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erreur lors de l'exclusion :", error);
      alert(error.message || "Impossible d'exclure ce membre.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-dim rounded-md hover:bg-surface-hover hover:border-border-focus transition-all shadow-sm group"
      >
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m, i) => (
            <div
              key={m.user.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-surface group-hover:border-surface-hover transition-colors z-[${3 - i}]`}
              style={{ backgroundColor: getAvatarColor(m.id, m.user.name) }}
            >
              {getInitials(m.user.name)}
            </div>
          ))}
          {members.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-[10px] font-mono text-text-muted border-2 border-surface group-hover:border-surface-hover transition-colors z-0">
              +{members.length - 3}
            </div>
          )}
        </div>
        <Users className="w-4 h-4 text-text-muted ml-1" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl border border-border-dim shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border-dim flex justify-between items-center bg-surface">
              <div>
                <h2 className="text-lg font-bold text-text-main tracking-tight">
                  Membres du projet
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {members.length} participants
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {members.map((member) => {
                const isOwner = member.role === "OWNER";
                const isMe = member.user.id === currentUserId;
                const targetRoleWeight =
                  roleWeights[member.role || "DEVELOPER"];
                const currentUserWeight = roleWeights[currentUserRole];
                const canKick =
                  !isOwner && !isMe && currentUserWeight >= targetRoleWeight;

                return (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          backgroundColor: getAvatarColor(
                            member.id,
                            member.user.name,
                          ),
                        }}
                      >
                        {getInitials(member.user.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-main flex items-center gap-2">
                          {member.user.name.replace(" (Créateur)", "")}
                          {isMe && (
                            <span className="text-[10px] font-mono text-text-muted uppercase">
                              (Vous)
                            </span>
                          )}
                          {isOwner && (
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {isOwner ? "Propriétaire" : "Membre invité"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {updatingId === member.user.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      )}

                      {isOwner ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                          OWNER
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          disabled={
                            !canManageRoles ||
                            isMe ||
                            updatingId === member.user.id ||
                            removingId === member.user.id
                          }
                          onChange={(e) =>
                            handleRoleChange(member.user.id, e.target.value)
                          }
                          className={`text-xs px-2 py-1.5 rounded-md outline-none transition-colors ${
                            !canManageRoles || isMe
                              ? "bg-transparent text-text-muted border-transparent cursor-not-allowed"
                              : "bg-background border border-border-dim text-text-main focus:border-border-focus cursor-pointer"
                          }`}
                        >
                          <option value="DEVELOPER">Developer</option>
                          <option value="PO">Product Owner</option>
                        </select>
                      )}

                      {canKick && (
                        <button
                          onClick={() =>
                            setMemberToKick({
                              id: member.user.id,
                              name: member.user.name,
                            })
                          }
                          disabled={removingId === member.user.id}
                          className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Exclure ce membre"
                        >
                          {removingId === member.user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={memberToKick !== null}
        onClose={() => setMemberToKick(null)}
        onConfirm={executeRemoveMember}
        title="Exclure un membre"
        description={`Êtes-vous sûr de vouloir retirer ${memberToKick?.name} du projet ? Il n'aura plus accès aux tickets ni à la documentation.`}
        confirmText="Exclure du projet"
        isLoading={removingId !== null}
      />
    </>
  );
}
