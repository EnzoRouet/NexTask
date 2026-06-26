"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/register/PasswordInput";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'inscription : ${response.status}`);
      }

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError(`${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border-dim p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md flex flex-col gap-6"
      >
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Rejoindre Nex<span className="text-accent">Task</span>
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Créez votre compte pour commencer à gérer vos projets.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Nom complet <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={name}
            placeholder="Ex: Jean Dupont"
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 shadow-inner"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Email <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            value={email}
            placeholder="jean.dupont@coda.fr"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 shadow-inner"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Mot de passe <span className="text-accent">*</span>
          </label>
          <PasswordInput
            value={password}
            onChange={(val, isValid) => {
              setPassword(val);
              setIsPasswordValid(isValid);
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid}
          className="w-full flex justify-center items-center gap-2 bg-accent text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <div className="mt-2 text-center pt-4 border-t border-border-dim">
          <p className="text-sm text-text-muted">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-white hover:text-accent font-medium transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
