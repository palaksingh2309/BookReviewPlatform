"use client";

import {
  ArrowRight,
  BookOpen,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Search,
  ChevronRight,
} from "lucide-react";

const books = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    rating: "4.9",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    rating: "4.8",
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    rating: "4.7",
    color: "from-purple-500 to-indigo-500",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "Discover Books",
    desc: "Explore thousands of books from every genre imaginable.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Connect with readers, follow friends and join discussions.",
  },
  {
    icon: TrendingUp,
    title: "Reading Goals",
    desc: "Track your progress with beautiful analytics.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute h-96 w-96 rounded-full bg-indigo-600/20 blur-[140px] top-10 left-10" />
        <div className="absolute h-96 w-96 rounded-full bg-pink-600/20 blur-[140px] bottom-10 right-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06),transparent_60%)]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="text-indigo-400" />
            BookVerse
          </div>

          <nav className="hidden md:flex gap-8 text-sm text-neutral-300">
            <a href="#">Home</a>
            <a href="#">Books</a>
            <a href="#">Reviews</a>
            <a href="#">Community</a>
          </nav>

          <button className="rounded-full bg-white text-black px-5 py-2 font-semibold hover:scale-105 transition">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
            <Sparkles size={16} />
            The Modern Home for Readers
          </span>

          <h1 className="text-6xl lg:text-7xl font-black mt-8 leading-none">
            Read.
            <br />
            Review.
            <br />
            <span className="text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text">
              Connect.
            </span>
          </h1>

          <p className="mt-8 text-neutral-400 text-lg leading-8 max-w-xl">
            Discover books you'll love, write meaningful reviews, build your
            reading journey and connect with readers around the world.
          </p>

          <div className="mt-10 flex gap-4">
            <button className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-4 font-semibold flex items-center gap-2">
              Explore Books
              <ArrowRight size={18} />
            </button>

            <button className="rounded-full border border-white/10 px-6 py-4 hover:bg-white/5">
              Learn More
            </button>
          </div>

          <div className="mt-12 flex gap-10">
            <div>
              <h2 className="text-3xl font-bold">20K+</h2>
              <p className="text-neutral-500">Readers</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold">100K+</h2>
              <p className="text-neutral-500">Reviews</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold">50K+</h2>
              <p className="text-neutral-500">Books</p>
            </div>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="relative">
          <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl">Trending Today</h3>

              <Search className="text-neutral-400" />
            </div>

            <div className="mt-8 space-y-5">
              {books.map((book) => (
                <div
                  key={book.title}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/5 transition"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-16 h-20 rounded-xl bg-gradient-to-br ${book.color}`}
                    />

                    <div>
                      <h4 className="font-semibold">{book.title}</h4>
                      <p className="text-sm text-neutral-400">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star fill="currentColor" size={18} />
                    {book.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 rounded-3xl bg-gradient-to-r from-indigo-500 to-pink-500 p-6 shadow-2xl">
            <p className="text-sm opacity-80">Reading Streak</p>
            <h2 className="text-4xl font-black mt-2">18 Days 🔥</h2>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-black">
            Everything a Reader Needs
          </h2>

          <p className="text-neutral-400 mt-5 max-w-2xl mx-auto">
            Beautiful tools designed for discovering, reviewing and sharing your
            reading experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:-translate-y-2 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Icon className="text-indigo-400" />
                </div>

                <h3 className="text-2xl font-bold mt-6">
                  {feature.title}
                </h3>

                <p className="text-neutral-400 mt-4 leading-7">
                  {feature.desc}
                </p>

                <button className="mt-8 flex items-center gap-2 text-indigo-400 font-semibold">
                  Learn More
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}