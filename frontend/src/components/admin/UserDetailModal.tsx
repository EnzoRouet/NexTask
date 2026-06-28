"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { X, ShieldAlert, KeyRound, AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface UserDetailModalProps {
  userId: string;
  token: string;
  currentUserId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserDetailModal({
  userId,
  token,
  currentUserId,
  onClose,
  onUpdate,
}: Readonly<UserDetailModalProps>) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [confirmAction, setConfirmAction] = useState<"RESET" | "DELETE" | null>(
    null,
  );
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiFetch<UserDetail>(
          `/admin/users/${userId}`,
          {},
          token,
        );
        setUser(data);
      } catch {
        setMessage({ text: "Erreur de chargement", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [userId, token]);

  const handleRoleChange = async () => {
    if (!user) return;
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      const updatedUser = await apiFetch<UserDetail>(
        `/admin/users/${userId}/update-role`,
        { method: "PATCH", body: JSON.stringify({ newRole }) },
        token,
      );
      setUser(updatedUser);
      onUpdate();
      setMessage({ text: "Rôle mis à jour avec succès", type: "success" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ text: error.message || "Erreur", type: "error" });
    }
  };

  const executePasswordReset = async () => {
    setIsProcessingAction(true);
    try {
      await apiFetch(
        `/admin/users/${userId}/reset-password`,
        { method: "PATCH", body: JSON.stringify({ newPassword }) },
        token,
      );
      setNewPassword("");
      setMessage({ text: "Mot de passe réinitialisé", type: "success" });
      setConfirmAction(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ text: error.message || "Erreur", type: "error" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const executeDeleteUser = async () => {
    setIsProcessingAction(true);
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" }, token);
      setMessage({ text: "Utilisateur banni avec succès.", type: "success" });
      onUpdate();
      setConfirmAction(null);
      setTimeout(() => onClose(), 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ text: error.message || "Erreur", type: "error" });
      setIsProcessingAction(false);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all p-4">
        <div className="bg-surface border border-border-dim rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col overflow-hidden relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 pb-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {user?.name}
            </h2>
            <p className="text-text-muted font-mono mt-1 text-sm">
              {user?.email}
            </p>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
            <div className="p-4 bg-background border border-border-dim rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-text-main">
                  Rôle de l&apos;utilisateur
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    user?.role === "ADMIN"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-accent/10 text-accent border-accent/20"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              {userId !== currentUserId && (
                <button
                  onClick={handleRoleChange}
                  className="w-full py-2 bg-surface hover:bg-surface-hover border border-border-dim hover:border-border-focus text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-text-muted" />
                  Changer le rôle en {user?.role === "ADMIN" ? "USER" : "ADMIN"}
                </button>
              )}
            </div>

            {userId !== currentUserId && (
              <div className="p-4 bg-background border border-border-dim rounded-lg">
                <span className="block text-sm font-semibold text-text-main mb-3">
                  Forcer un accès
                </span>
                <input
                  type="text"
                  placeholder="Nouveau mot de passe (12 car. min)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border-dim rounded-md text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all mb-3 placeholder:text-border-focus"
                />
                <button
                  onClick={() => {
                    if (newPassword.length < 12) {
                      setMessage({
                        text: "12 caractères minimum",
                        type: "error",
                      });
                      return;
                    }
                    setConfirmAction("RESET");
                  }}
                  className="w-full py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20 rounded-md transition-all text-sm font-bold flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Réinitialiser
                </button>
              </div>
            )}

            {userId !== currentUserId && (
              <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                <span className="flex items-center gap-2 text-sm font-bold text-red-500 mb-2">
                  <AlertTriangle className="w-4 h-4" /> Zone de Danger
                </span>
                <p className="text-xs text-red-400/80 mb-4 leading-relaxed">
                  Cette action désactivera le compte instantanément.
                  L&apos;email sera obfusqué pour des raisons de conformité.
                </p>
                <button
                  onClick={() => setConfirmAction("DELETE")}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-md transition-all text-sm font-bold"
                >
                  Bannir définitivement
                </button>
              </div>
            )}

            {message.text && (
              <div
                className={`p-3 rounded-md text-sm font-medium text-center border ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmAction === "RESET"}
        onClose={() => setConfirmAction(null)}
        onConfirm={executePasswordReset}
        title="Forcer le mot de passe"
        description="Êtes-vous sûr de vouloir forcer ce nouveau mot de passe ? L'ancien ne fonctionnera plus immédiatement."
        confirmText="Réinitialiser"
        isLoading={isProcessingAction}
        isDestructive={false}
      />

      <ConfirmModal
        isOpen={confirmAction === "DELETE"}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeDeleteUser}
        title="Bannir l'utilisateur"
        description={`Êtes-vous sûr de vouloir bannir ${user?.name} ? Son accès sera révoqué de tous les projets.`}
        confirmText="Bannir définitivement"
        isLoading={isProcessingAction}
        isDestructive={true}
      />
    </>
  );
}
