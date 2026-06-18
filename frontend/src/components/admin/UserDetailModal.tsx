"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiFetch<UserDetail>(`/admin/${userId}`, {}, token);
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
        {
          method: "PATCH",
          body: JSON.stringify({ newRole }),
        },
        token,
      );

      setUser(updatedUser);
      onUpdate();
      setMessage({ text: "Rôle mis à jour avec succès", type: "success" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({
        text: error.message || "Erreur lors de la mise à jour",
        type: "error",
      });
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword.length < 12) {
      setMessage({
        text: "Le mot de passe doit faire 12 caractères minimum",
        type: "error",
      });
      return;
    }

    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir forcer ce nouveau mot de passe ?",
      )
    )
      return;

    try {
      await apiFetch(
        `/admin/users/${userId}/reset-password`,
        {
          method: "PATCH",
          body: JSON.stringify({ newPassword }),
        },
        token,
      );

      setNewPassword("");
      setMessage({ text: "Mot de passe réinitialisé", type: "success" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({
        text: error.message || "Erreur de réinitialisation",
        type: "error",
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#151921] border border-neutral-800 rounded-xl p-8 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
        <p className="text-neutral-400 mb-6">{user?.email}</p>

        <div className="space-y-6">
          <div className="p-4 bg-[#0D1016] rounded-lg border border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-300 font-medium">Rôle actuel</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${user?.role === "ADMIN" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
              >
                {user?.role}
              </span>
            </div>
            {userId !== currentUserId && (
              <button
                onClick={handleRoleChange}
                className="w-full mt-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition text-sm font-medium"
              >
                Basculer le rôle en {user?.role === "ADMIN" ? "USER" : "ADMIN"}
              </button>
            )}
          </div>

          {userId !== currentUserId && (
            <div className="p-4 bg-[#0D1016] rounded-lg border border-neutral-800">
              <span className="block text-neutral-300 font-medium mb-3">
                Forcer un nouveau mot de passe
              </span>
              <input
                type="text"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#151921] border border-neutral-700 rounded px-3 py-2 text-white mb-3 focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={handlePasswordReset}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm font-bold"
              >
                Réinitialiser l&apos;accès
              </button>
            </div>
          )}

          {message.text && (
            <div
              className={`p-3 rounded text-sm text-center ${message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
