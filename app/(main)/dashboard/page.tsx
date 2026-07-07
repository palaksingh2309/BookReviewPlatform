import Link from "next/link";
import { BookOpen, Settings, User } from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { createClient } from "../../../lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "Reader";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-600/10 blur-[120px]" />
      </div>

      <header className="border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display flex items-center gap-2 text-lg font-bold"
          >
            <BookOpen className="h-5 w-5 text-indigo-400" />
            BookVerse
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Profile"
            >
              <User size={18} />
            </Link>
            <Link
              href="/settings"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Settings"
            >
              <Settings size={18} />
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
            Dashboard
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold">
            Welcome back, {email.split("@")[0]}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-400">
            You&apos;re all set. Your reading lists, reviews, and goals will
            appear here as you explore BookVerse.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Books read", value: "0" },
              { label: "Reviews written", value: "0" },
              { label: "Reading streak", value: "0 days" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
