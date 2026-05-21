import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import TestApiButton from "@/components/TestApiButton"; // 1. L'import

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black">
      <h1 className="text-4xl font-bold mb-8">Tableau de bord NexTask</h1>

      {session ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center w-125">
          <p className="text-lg text-gray-600">Connexion réussie !</p>
          <p className="text-2xl font-bold text-blue-600 mt-2 mb-6">
            Bonjour, {session.user?.name}
          </p>

          <LogoutButton />

          <TestApiButton token={session.access_token} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-red-500">Tu n&apos;es pas connecté.</p>
        </div>
      )}
    </div>
  );
}
