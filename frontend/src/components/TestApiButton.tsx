/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Le passeport pour utiliser useState et onClick

import { useState } from "react";
import { apiFetch } from "@/lib/api";

// On attend le token depuis le composant parent (la page serveur)
export default function TestApiButton({ token }: { token?: string }) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!token) return setResult("Aucun token disponible");

    setIsLoading(true);
    try {
      const data = await apiFetch<any>("/auth/me", { method: "GET" }, token);
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`Erreur API : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center w-full">
      <button
        onClick={handleTest}
        disabled={isLoading}
        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
      >
        {isLoading ? "Test en cours..." : "Tester l'API NestJS"}
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-900 text-green-400 text-xs rounded w-full overflow-x-auto text-left">
          {result}
        </pre>
      )}
    </div>
  );
}
