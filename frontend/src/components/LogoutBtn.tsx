"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-6 px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
    >
      Se déconnecter
    </button>
  );
}
