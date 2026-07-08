import Link from "next/link";
import { BookOpen, Settings, User } from "lucide-react";

import ProfileForm from "../../../components/profile/ProfileForm";
import SignOutButton from "../../../components/auth/SignOutButton";
import { createClient } from "../../../lib/supabase-server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "Reader";
  const userInitials = email.substring(0, 2).toUpperCase();

  // Try to load username for secondary label
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .maybeSingle();

  const displayName = profile?.full_name || email.split("@")[0];
  const displayUsername = profile?.username ? `@${profile.username}` : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="font-display flex items-center gap-2 text-lg font-bold transition hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
            </span>
            BookVerse
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/15"
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
            <div className="h-4 w-px bg-white/10 mx-1" />
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Account Management
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">My Profile</h1>
          <p className="text-neutral-400 text-sm mt-1">Configure your public information, biography, and reading preferences.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Left Column - User Info Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm h-fit space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-3xl font-bold text-white shadow-xl shadow-indigo-500/10 ring-4 ring-neutral-900">
                {userInitials}
              </div>
              <h2 className="mt-5 text-xl font-bold">{displayName}</h2>
              {displayUsername && (
                <p className="text-sm text-indigo-300 font-medium mt-0.5">{displayUsername}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">{email}</p>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Favorite Genre</p>
                <p className="text-sm font-medium mt-1 text-neutral-300">
                  {profile?.favorite_genre || "Not specified yet"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Joined</p>
                <p className="text-sm font-medium mt-1 text-neutral-300">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl">
            <h2 className="font-display text-xl font-bold mb-6">Profile Settings</h2>
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
}