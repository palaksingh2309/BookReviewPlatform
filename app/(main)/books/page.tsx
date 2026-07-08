"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  User,
  Search,
  Heart,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  BookMarked,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  reviewsCount: number;
  publishedYear: number;
  image: string;
  description: string;
  isTrending: boolean;
  isTopRated: boolean;
}

const ALL_BOOKS: Book[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Improvement",
    rating: 4.9,
    reviewsCount: 28450,
    publishedYear: 2018,
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    description: "A practical guide to building good habits, breaking bad ones, and making tiny changes that lead to remarkable results. It explains the neurology behind habit formation and offers concrete tools.",
    isTrending: true,
    isTopRated: true,
  },
  {
    id: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    rating: 4.9,
    reviewsCount: 15430,
    publishedYear: 2020,
    image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave. Explores how emotions, behavior, and mindset influence financial success.",
    isTrending: true,
    isTopRated: true,
  },
  {
    id: "the-hobbit",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    category: "Fiction",
    rating: 4.9,
    reviewsCount: 31200,
    publishedYear: 1937,
    image: "https://covers.openlibrary.org/b/isbn/9780261103344-L.jpg",
    description: "A fantasy novel about the quest of Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon. It serves as the prelude to the epic Lord of the Rings trilogy.",
    isTrending: false,
    isTopRated: true,
  },
  {
    id: "the-alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    rating: 4.8,
    reviewsCount: 19800,
    publishedYear: 1988,
    image: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
    description: "A timeless story about following your dreams, discovering your purpose, and listening to your heart. It follows a young Andalusian shepherd boy on his journey to Egypt.",
    isTrending: false,
    isTopRated: true,
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    rating: 4.8,
    reviewsCount: 9820,
    publishedYear: 2016,
    image: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
    description: "Rules for focused success in a distracted world. Master the ability to focus deeply without distraction, allowing you to quickly master complicated information and produce better results.",
    isTrending: true,
    isTopRated: true,
  },
  {
    id: "think-like-a-monk",
    title: "Think Like a Monk",
    author: "Jay Shetty",
    category: "Mindfulness",
    rating: 4.8,
    reviewsCount: 11450,
    publishedYear: 2020,
    image: "https://covers.openlibrary.org/b/isbn/9781982134488-L.jpg",
    description: "Practical wisdom inspired by monk life to reduce stress, improve relationships, and find purpose. He shows how to overcome negative thoughts and find peace within ourselves.",
    isTrending: false,
    isTopRated: true,
  },
  {
    id: "dune",
    title: "Dune",
    author: "Frank Herbert",
    category: "Science Fiction",
    rating: 4.8,
    reviewsCount: 25400,
    publishedYear: 1965,
    image: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad'Dib, embarking on a journey to avenge his family.",
    isTrending: true,
    isTopRated: true,
  },
  {
    id: "educated",
    title: "Educated",
    author: "Tara Westover",
    category: "Biography",
    rating: 4.7,
    reviewsCount: 16800,
    publishedYear: 2018,
    image: "https://covers.openlibrary.org/b/isbn/9780399588174-L.jpg",
    description: "An unforgettable memoir about a young girl who, kept out of school by her survivalist family in rural Idaho, leaves her home at seventeen and earns a PhD from Cambridge University.",
    isTrending: false,
    isTopRated: false,
  },
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Finance",
    rating: 4.7,
    reviewsCount: 22100,
    publishedYear: 1997,
    image: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
    description: "Advocates for financial literacy, financial independence, and building wealth through investing in assets, real estate, starting businesses, and increasing financial intelligence.",
    isTrending: false,
    isTopRated: false,
  },
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    category: "Finance",
    rating: 4.6,
    reviewsCount: 13900,
    publishedYear: 2014,
    image: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
    description: "Notes on startups, or how to build the future. Explores how unique value creation and building creative monopolies are the keys to successful, game-changing business endeavors.",
    isTrending: false,
    isTopRated: false,
  }
];

const CATEGORIES = [
  "All",
  "Self Improvement",
  "Fiction",
  "Finance",
  "Productivity",
  "Mindfulness",
  "Science Fiction",
  "Biography"
];

// Feature a top book
const FEATURED_BOOK = ALL_BOOKS[1]; // The Psychology of Money

export default function BooksPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "top-rated" | "wishlist">("all");
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("bookverse_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading wishlist from localStorage", e);
      }
    }
  }, []);

  const toggleWishlist = (bookId: string) => {
    const updated = wishlist.includes(bookId)
      ? wishlist.filter((id) => id !== bookId)
      : [...wishlist, bookId];
    setWishlist(updated);
    localStorage.setItem("bookverse_wishlist", JSON.stringify(updated));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setActiveTab("all");
  };

  // Filter books dynamically based on states
  const filteredBooks = ALL_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "trending" && book.isTrending) ||
      (activeTab === "top-rated" && book.rating >= 4.8) ||
      (activeTab === "wishlist" && wishlist.includes(book.id));

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative">
      {/* Dynamic glow backdrops */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[35rem] w-[35rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[35rem] w-[35rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      {/* Global Navigation */}
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        {/* Page Title Header */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Catalog Browse
          </span>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Discover Your Next Read
          </h1>
          <p className="mt-3 text-neutral-400 max-w-2xl leading-relaxed text-sm md:text-base">
            Explore our curated catalog of leading self-improvement guides, deep technical literature, fiction blockbusters, and mindfulness classics.
          </p>
        </div>

        {/* Featured Book Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm shadow-xl group hover:border-indigo-500/20 transition-all duration-500">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-20 h-60 w-60 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

          <div className="relative grid gap-8 md:grid-cols-12 items-center">
            {/* Cover Column */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-44 h-64 md:w-52 md:h-76 shadow-2xl rounded-xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={FEATURED_BOOK.image}
                  alt={FEATURED_BOOK.title}
                  fill
                  sizes="(max-width: 768px) 176px, 208px"
                  priority
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Info Column */}
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-xs font-semibold tracking-wider uppercase">
                <Sparkles size={12} className="animate-pulse" />
                Featured Pick of the Month
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {FEATURED_BOOK.title}
              </h2>
              <p className="text-neutral-400 font-medium text-sm md:text-base">
                by <span className="text-white hover:underline cursor-pointer">{FEATURED_BOOK.author}</span> · {FEATURED_BOOK.publishedYear}
              </p>
              <div className="flex items-center gap-4 text-xs md:text-sm">
                <span className="bg-white/10 px-3 py-1 rounded-full text-neutral-300 font-semibold border border-white/5">
                  {FEATURED_BOOK.category}
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star size={16} fill="currentColor" />
                  {FEATURED_BOOK.rating}
                </span>
                <span className="text-neutral-500">
                  ({FEATURED_BOOK.reviewsCount.toLocaleString()} reviews)
                </span>
              </div>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-xl">
                {FEATURED_BOOK.description}
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={() => toggleWishlist(FEATURED_BOOK.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border text-sm ${
                    wishlist.includes(FEATURED_BOOK.id)
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                      : "bg-white text-neutral-950 border-white hover:bg-white/90 hover:shadow-lg hover:shadow-white/5"
                  }`}
                >
                  <Heart size={16} className={wishlist.includes(FEATURED_BOOK.id) ? "fill-rose-400" : ""} />
                  {wishlist.includes(FEATURED_BOOK.id) ? "In Wishlist" : "Add to Wishlist"}
                </button>
                <Link
                  href="/reading-list"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-5 py-2.5 rounded-xl font-semibold transition text-sm text-white"
                >
                  <BookMarked size={16} />
                  Start Reading
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar: Search, Filters, Tabs */}
        <section className="space-y-6">
          {/* Top Row: Search and Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search titles, authors, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition duration-300"
              />
              {searchQuery && (
                <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                title="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Filters / Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 self-start md:self-auto overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All Books", icon: BookOpen },
                { id: "trending", label: "Trending", icon: TrendingUp },
                { id: "top-rated", label: "Top Rated", icon: Award },
                { id: "wishlist", label: "Wishlist", icon: Heart },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={tab.id === "wishlist" && active ? "fill-white" : ""} />
                    {tab.label}
                    {tab.id === "wishlist" && mounted && wishlist.length > 0 && (
                      <span className="ml-1 bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] text-white font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Category Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal size={12} />
              Genres
            </span>
            <div className="flex gap-2">
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-300 whitespace-nowrap ${
                      active
                        ? "bg-white text-neutral-950 border-white hover:bg-neutral-100"
                        : "bg-transparent text-neutral-400 border-white/10 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Books List Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
              {activeTab === "all" && "All Available Titles"}
              {activeTab === "trending" && "Hot & Trending Reads"}
              {activeTab === "top-rated" && "Critically Acclaimed Selection"}
              {activeTab === "wishlist" && "Your Personal Saved Wishlist"}
              <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-sans">
                {filteredBooks.length}
              </span>
            </h2>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8">
              <div className="p-4 rounded-full bg-white/5 text-neutral-500 mb-4">
                <BookOpen size={36} />
              </div>
              <h3 className="text-lg font-bold">No books match your criteria</h3>
              <p className="text-neutral-500 mt-2 text-sm max-w-sm">
                Try revising your search text, choosing a different category, or adding items to your wishlist.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-lg shadow-indigo-600/10"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book, idx) => {
                const isSaved = wishlist.includes(book.id);
                // Assign custom glows or special badges to top ranks
                const isGold = idx === 0 && searchQuery === "" && selectedCategory === "All" && activeTab === "all";
                const isSilver = idx === 1 && searchQuery === "" && selectedCategory === "All" && activeTab === "all";
                const isBronze = idx === 2 && searchQuery === "" && selectedCategory === "All" && activeTab === "all";

                return (
                  <li
                    key={book.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
                  >
                    {/* Hover border shine effect */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-indigo-500/10 rounded-2xl transition duration-300 pointer-events-none" />

                    <div>
                      {/* Image / Rank Wrapper */}
                      <div className="relative h-64 w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent z-10" />
                        
                        <Image
                          src={book.image}
                          alt={book.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />

                        {/* Top corner buttons */}
                        <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start z-20">
                          {/* Rank Badge */}
                          <span
                            className={`flex h-7 px-2.5 items-center justify-center rounded-lg text-xs font-extrabold tracking-wide uppercase shadow-lg border backdrop-blur-sm ${
                              isGold
                                ? "bg-amber-400 text-neutral-950 border-amber-300 font-bold"
                                : isSilver
                                ? "bg-slate-300 text-neutral-950 border-slate-200 font-bold"
                                : isBronze
                                ? "bg-amber-700 text-white border-amber-600 font-bold"
                                : "bg-neutral-950/75 text-neutral-300 border-white/10"
                            }`}
                          >
                            Rank #{idx + 1}
                          </span>

                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(book.id)}
                            className={`p-2 rounded-lg backdrop-blur-md shadow-lg border transition ${
                              isSaved
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
                                : "bg-neutral-950/60 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                            title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart size={16} className={isSaved ? "fill-rose-400" : ""} />
                          </button>
                        </div>
                      </div>

                      {/* Content Box */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-400/15 px-2.5 py-0.5 rounded-full font-semibold">
                            {book.category}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star size={13} fill="currentColor" />
                            {book.rating}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-bold group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                            by {book.author} · {book.publishedYear}
                          </p>
                        </div>

                        <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="px-5 pb-5 pt-2">
                      <Link
                        href={`/reviews?book=${book.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-2.5 text-xs font-semibold transition duration-300 text-white"
                      >
                        Read Reviews & Write
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}