import { requireAuth } from "@/lib/require-auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">You're in.</h1>
        <p className="text-zinc-400 text-sm mb-6">{user.email}</p>
        <a href="/logout" className="text-indigo-400 hover:underline text-sm">
          Log out
        </a>
      </div>
    </main>
  );
}
