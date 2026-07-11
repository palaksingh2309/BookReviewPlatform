import Link from "next/link";
import {
  BookOpen,
  Settings,
  User,
  Search,
  BookMarked,
  MessageSquare,
  Heart,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { createClient } from "../../../lib/supabase-server";
import { getReadingStats } from "../../../services/reading-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "Reader";
  const username = email.split("@")[0];

  const { data: stats } = user ? await getReadingStats(supabase) : { data: null };
  const { count: reviewsCount } = user
    ? await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
    : { count: 0 };


  const quickActions = [
    {
      title: "Browse Catalog",
      description: "Discover curated lists, trending books, and search for your next read.",
      href: "/books",
      icon: Search,
      badge: "New",
    },
    {
      title: "Reading List",
      description: "Track your active books, log pages read, and monitor progress.",
      href: "/reading-list",
      icon: BookMarked,
    },
    {
      title: "My Reviews",
      description: "Write, edit, and read thoughtful book reviews and community comments.",
      href: "/reviews",
      icon: MessageSquare,
    },
    {
      title: "Wishlist",
      description: "Save high-interest books you intend to read in the future.",
      href: "/wishlist",
      icon: Heart,
    },
    {
      title: "Edit Profile",
      description: "Customize your bio, upload an avatar, and set your favorite genres.",
      href: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      description: "Manage password updates, session preferences, and privacy controls.",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
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
            <div className="h-4 w-px bg-white/10 mx-1" />
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 opacity-30" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Dashboard
            </p>
            <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
              Welcome back, {username}
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed">
              Explore your personal reading space. Track pages, update your wishlist, write community reviews, and find recommendations.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Books read", value: stats?.booksCompleted || 0, icon: BookOpen },
                { label: "Reviews written", value: reviewsCount || 0, icon: MessageSquare },
                { label: "Reading streak", value: `${stats?.streakDays || 0} days`, icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 flex items-center justify-between group hover:border-white/20 transition-all duration-300"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-500">{item.label}</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">{item.value}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 text-neutral-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/10 transition-all duration-300">
                      <Icon size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Quick Actions</h2>
            <p className="text-sm text-neutral-400 mt-1">Navigate to different features and manage your BookVerse account.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:text-indigo-200 transition-colors">
                        <Icon size={22} />
                      </div>
                      {action.badge && (
                        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/20">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                      {action.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
