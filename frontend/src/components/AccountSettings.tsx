"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Trash2,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "./ConfirmModal";
import { signOut } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface AccountSettingsProps {
  initialUser: UserProfile;
  token: string;
}

export function AccountSettings({
  initialUser,
  token,
}: Readonly<AccountSettingsProps>) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      await apiFetch(
        `/user/me`,
        {
          method: "PATCH",
          body: JSON.stringify({ name, email }),
        },
        token,
      );

      setProfileMessage({
        type: "success",
        text: "Profil mis à jour avec succès.",
      });
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setProfileMessage({
        type: "error",
        text: error.message || "Erreur lors de la mise à jour du profil.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Les nouveaux mots de passe ne correspondent pas.",
      });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage(null);

    try {
      await apiFetch(
        `/user/me/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
        },
        token,
      );

      setPasswordMessage({
        type: "success",
        text: "Mot de passe sécurisé avec succès.",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setPasswordMessage({
        type: "error",
        text: error.message || "Impossible de modifier le mot de passe.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/user/me`, { method: "DELETE" }, token);
      await signOut({ callbackUrl: "/register" });
      router.push("/register");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue lors de la suppression.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors w-fit p-1.5 -ml-1.5 rounded-md hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Paramètres du compte
          </h1>
          <p className="text-text-muted mt-2">
            Gérez vos informations personnelles et la sécurité de votre espace
            de travail.
          </p>
        </div>
      </div>

      <section className="bg-surface border border-border-dim rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/2">
          <User className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-white">
            Informations Générales
          </h2>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="p-6 flex flex-col gap-6"
        >
          {profileMessage && (
            <div
              className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 ${profileMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {profileMessage.text}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile || (!name.trim() && !email.trim())}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-surface border border-border-dim rounded-lg transition-all hover:bg-white/5 hover:border-white/20 disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-surface border border-border-dim rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-white">
            Sécurité & Mot de passe
          </h2>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="p-6 flex flex-col gap-6"
        >
          {passwordMessage && (
            <div
              className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 ${passwordMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <div className="flex flex-col gap-2 max-w-md">
            <label
              htmlFor="oldPassword"
              className="text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Mot de passe actuel
            </label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
              required
            />
          </div>

          <div className="h-px w-full bg-white/5 my-2"></div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="newPassword"
                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
                required
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white shadow-inner focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50"
                required
              />
            </div>
          </div>

          <ul className="text-[11px] text-text-muted list-disc list-inside space-y-1 mt-1 pl-1">
            <li>Minimum 12 caractères</li>
            <li>Au moins une majuscule et une minuscule</li>
            <li>Au moins un chiffre et un caractère spécial</li>
          </ul>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={
                isSavingPassword ||
                !oldPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sécurisation...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden mt-4">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Zone de danger
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              La suppression de votre compte est irréversible. Toutes vos
              données personnelles seront effacées de nos serveurs. Vos
              contributions aux projets partagés (tickets, commentaires) seront
              conservées sous forme d&apos;archives anonymes.
            </p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0 px-4 py-2 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Supprimer mon compte
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteAccount}
        title="Suppression définitive"
        description={`Êtes-vous absolument sûr de vouloir supprimer le compte "${email}" ? Cette action ne peut pas être annulée.`}
        confirmText="Oui, supprimer mon compte"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
}
