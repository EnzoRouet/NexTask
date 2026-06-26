import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AccountSettings } from "@/components/AccountSettings";

export const metadata = {
  title: "Paramètres du compte | NexTask",
  description: "Gérez vos informations personnelles et votre sécurité.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.access_token) {
    redirect("/login");
  }

  const initialUser = {
    id: session.user.id as string,
    name: session.user.name as string,
    email: session.user.email as string,
  };

  return (
    <div className="min-h-screen bg-background text-text-main pt-24 px-4 sm:px-6 lg:px-8">
      <AccountSettings initialUser={initialUser} token={session.access_token} />
    </div>
  );
}
