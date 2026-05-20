import React from "react";
import LogoutButton from "@/components/LogoutButton";

export default function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-gray-100 text-black">
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-10 tracking-tight">
          Nex<span className="text-green-400">Task</span>
        </h1>

        <nav className="flex-1 space-y-4">
          <div className="p-3 bg-gray-800 rounded-lg cursor-pointer">
            Tableau de bord
          </div>
          <div className="p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
            Paramètres
          </div>
          <div className="p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
