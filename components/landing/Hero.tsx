"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const books = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    rating: 4.9,
    reviews: "12.4k",
    genre: "Self-improvement",
    color: "from-amber-500 via-orange-500 to-red-500",
    spine: "#c2410c",
    blurb: "Tiny changes, remarkable results — the definitive guide to building good habits.",
  },
  {
    id: "the-alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    rating: 4.8,
    reviews: "9.8k",
    genre: "Fiction",
    color: "from-yellow-400 via-amber-500 to-orange-600",
    spine: "#b45309",
    blurb: "A magical fable about following your dreams and listening to your heart.",
  },
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    rating: 4.7,
    reviews: "8.1k",
    genre: "Sci-fi",
    color: "from-violet-500 via-purple-600 to-indigo-700",
    spine: "#6d28d9",
    blurb: "Epic world-building on a desert planet where spice controls everything.",
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    rating: 4.9,
    reviews: "7.2k",
    genre: "Sci-fi",
    color: "from-sky-400 via-blue-500 to-indigo-600",
    spine: "#2563eb",
    blurb: "A lone astronaut races to save humanity in this gripping space thriller.",
  },
];

const avatars = ["PS", "MC", "AL", "JR", "NK"];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(books[0].id);

  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return books;
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.genre.toLowerCase().includes(normalized)
    );
  }, [query]);

  useEffect(() => {
    if (!filteredBooks.some((book) => book.id === activeId)) {
      setActiveId(filteredBooks[0]?.id ?? books[0].id);
    }
  }, [filteredBooks, activeId]);

  const activeBook =
    filteredBooks.find((book) => book.id === activeId) ?? filteredBooks[0] ?? books[0];

  return (
    <section className="relative overflow-hidden bg-library-pattern">
      {/* Hero-specific atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute -right-16 top-48 h-80 w-80 rounded-full bg-rose-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-20">
          {/* Copy column */}
          <div className="max-w-2xl">
            <div className="hero-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-300" />
              </span>
              <Sparkles size={14} className="text-indigo-300" />
              <span className="font-medium">20,000+ readers already on BookVerse</span>
            </div>

            <h1 className="hero-fade-up hero-fade-up-delay-1 font-display mt-8 text-[2.75rem] font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Where every book
              <span className="mt-1 block">
                finds its{" "}
                <span className="hero-shimmer-text bg-gradient-to-r from-indigo-200 via-white to-pink-200 bg-clip-text text-transparent">
                  perfect reader.
                </span>
              </span>
            </h1>

            <p className="hero-fade-up hero-fade-up-delay-2 mt-7 max-w-xl text-lg leading-8 text-neutral-400 sm:text-xl sm:leading-9">
              Discover stories you&apos;ll love, share reviews that matter, and
              build a reading life you&apos;re proud of — all in one beautiful
              place.
            </p>

            <div className="hero-fade-up hero-fade-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-neutral-950 shadow-xl shadow-white/10 transition hover:scale-[1.02] hover:bg-neutral-100"
              >
                Start reading free
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="#trending"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
              >
                Explore trending
              </Link>
            </div>

            <div className="hero-fade-up hero-fade-up-delay-4 mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {avatars.map((initials, i) => (
                    <div
                      key={initials}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-950 bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white"
                      style={{ zIndex: avatars.length - i }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-300">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">
                    Loved by passionate readers worldwide
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                {[
                  { value: "100K+", label: "Reviews" },
                  { value: "50K+", label: "Titles" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive visual column */}
          <div
            id="trending"
            className="hero-fade-up hero-fade-up-delay-2 relative scroll-mt-28"
          >
            {/* Glow behind card stack */}
            <div className="hero-pulse-ring absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-2xl" />

            <div className="relative">
              {/* Floating featured book */}
              <div className="hero-float absolute -left-2 top-8 z-20 hidden sm:block lg:-left-8">
                <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20">
                      <Flame className="text-orange-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Reading streak</p>
                      <p className="text-lg font-bold">18 days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-float-delayed absolute -right-2 top-24 z-20 hidden md:block lg:-right-6">
                <div className="rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span className="text-neutral-300">
                      <span className="font-semibold text-white">+24%</span> this week
                    </span>
                  </div>
                </div>
              </div>

              {/* Main discovery card */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/60 shadow-2xl backdrop-blur-2xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Featured book showcase */}
                <div className="border-b border-white/10 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="relative mx-auto sm:mx-0">
                      <div
                        className={`relative h-44 w-32 overflow-hidden rounded-xl bg-gradient-to-br ${activeBook.color} shadow-2xl sm:h-48 sm:w-36`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 w-3"
                          style={{ backgroundColor: activeBook.spine }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10" />
                        <div className="absolute bottom-4 left-5 right-4">
                          <p className="font-display text-sm font-bold leading-tight text-white drop-shadow">
                            {activeBook.title}
                          </p>
                          <p className="mt-1 text-xs text-white/80">
                            {activeBook.author}
                          </p>
                        </div>
                      </div>
                      {/* Decorative stacked books behind */}
                      <div className="absolute -right-4 top-3 -z-10 h-40 w-28 rotate-6 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 opacity-60" />
                      <div className="absolute -right-7 top-6 -z-20 h-36 w-24 rotate-12 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 opacity-40" />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-indigo-400/20">
                        <BookOpen size={12} />
                        {activeBook.genre}
                      </span>
                      <h2 className="font-display mt-3 text-2xl font-bold sm:text-3xl">
                        {activeBook.title}
                      </h2>
                      <p className="mt-1 text-neutral-400">by {activeBook.author}</p>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                        {activeBook.blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                        <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-300">
                          <Star size={14} fill="currentColor" />
                          {activeBook.rating}
                        </div>
                        <span className="text-sm text-neutral-500">
                          {activeBook.reviews} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search + list */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                        Live preview
                      </p>
                      <h3 className="font-display mt-1 text-xl font-semibold">
                        Discover trending books
                      </h3>
                    </div>
                  </div>

                  <label className="relative mt-5 block">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title, author, or genre..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/15"
                      aria-label="Search trending books"
                    />
                  </label>

                  <div className="mt-4 space-y-2">
                    {filteredBooks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
                        No books match &ldquo;{query}&rdquo;. Try another search.
                      </div>
                    ) : (
                      filteredBooks.map((book, index) => {
                        const isActive = book.id === activeBook.id;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => setActiveId(book.id)}
                            className={`group flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${
                              isActive
                                ? "border-indigo-400/40 bg-indigo-500/10"
                                : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-center text-xs font-bold text-neutral-600">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div
                                className={`h-12 w-9 shrink-0 rounded-md bg-gradient-to-br ${book.color}`}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium">{book.title}</p>
                                <p className="truncate text-xs text-neutral-500">
                                  {book.author}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pl-2">
                              {isActive && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                                  <Check size={12} className="text-white" />
                                </span>
                              )}
                              <span className="flex items-center gap-0.5 text-xs font-medium text-amber-300">
                                <Star size={12} fill="currentColor" />
                                {book.rating}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <Link
                    href="/signup"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Save to your reading list
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
