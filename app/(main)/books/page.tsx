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
  BookmarkCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../../services/wishlist";
import { getBooks, upsertBook } from "../../../services/books";
import { getReadingList } from "../../../services/reading-list";
import { upsertReadingListAction, deleteReadingListAction } from "../../../actions/readingList";
import { Book, ReadingStatus } from "../../../types/book";
import { getKeywordsFromDescription } from "../../../utils/helpers";

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

export default function BooksPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "top-rated" | "wishlist">("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [googleBooks, setGoogleBooks] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingList, setReadingList] = useState<{ [key: string]: ReadingStatus }>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load books, wishlist, and reading list on mount
  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        setLoading(true);
        // Fetch books from DB
        const { data: dbBooks } = await getBooks();
        if (dbBooks && dbBooks.length > 0) {
          setBooks(dbBooks);
        } else {
          console.warn("No books found in DB. Check schema seeds.");
        }

        // Fetch wishlist
        const dbWishlist = await getWishlist();
        setWishlist(dbWishlist);

        // Fetch reading list status
        const { data: dbRL } = await getReadingList();
        if (dbRL) {
          const rlMap: { [key: string]: ReadingStatus } = {};
          dbRL.forEach((entry) => {
            rlMap[entry.book_id] = entry.status;
          });
          setReadingList(rlMap);
        }
      } catch (e) {
        console.error("Error reading from database", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Google Books API search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGoogleBooks([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearching(true);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
        const url = apiKey
          ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=18&key=${apiKey}`
          : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=18`;

        const res = await fetch(url);

        if (!res.ok) {
          console.error("Google Books API error:", res.statusText);
          return;
        }

        const data = await res.json();
        const items = data.items || [];
        const mapped: Book[] = [];
        const seenIds = new Set<string>();

        for (const item of items) {
          if (!item.id || seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          const volumeInfo = item.volumeInfo || {};
          const rating = volumeInfo.averageRating || 0.0;
          const reviews_count = volumeInfo.ratingsCount || 0;

          mapped.push({
            id: item.id,
            title: volumeInfo.title || "Untitled",
            author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author",
            category: volumeInfo.categories ? volumeInfo.categories[0] : "General",
            rating: rating,
            reviews_count: reviews_count,
            published_year: volumeInfo.publishedDate
              ? parseInt(volumeInfo.publishedDate.substring(0, 4)) || 2020
              : 2020,
            image: volumeInfo.imageLinks?.thumbnail ||
                   volumeInfo.imageLinks?.smallThumbnail ||
                   "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300",
            description: volumeInfo.description || "No description available.",
            is_trending: false,
            is_top_rated: rating >= 4.5,
          });
        }

        setGoogleBooks(mapped);
      } catch (err) {
        console.error("Error searching books:", err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const toggleWishlist = async (bookId: string) => {
    const isSaved = wishlist.includes(bookId);
    if (isSaved) {
      setWishlist(wishlist.filter((id) => id !== bookId));
      await removeFromWishlist(bookId);
      showToast("Removed from Wishlist", "success");
    } else {
      // Find the book object in our current lists (either googleBooks or local books database list)
      const book = googleBooks.find(b => b.id === bookId) || books.find(b => b.id === bookId);
      if (book) {
        // Insert/upsert it into the database books table first to avoid foreign key violation
        const { error } = await upsertBook(book);
        if (error) {
          showToast("Failed to save book to database", "error");
          console.error("Error saving book:", error);
          return;
        }
        // Keep it in local books state so that the catalog contains it
        if (!books.some(b => b.id === bookId)) {
          setBooks(prev => [...prev, book]);
        }
      }
      setWishlist([...wishlist, bookId]);
      await addToWishlist(bookId);
      showToast("Added to Wishlist", "success");
    }
  };

  const handleUpdateReadingStatus = async (bookId: string, status: ReadingStatus | "remove") => {
    try {
      if (status === "remove") {
        const res = await deleteReadingListAction(bookId);
        if (res.success) {
          const updated = { ...readingList };
          delete updated[bookId];
          setReadingList(updated);
          showToast("Removed from reading list", "success");
        } else {
          showToast(res.error || "Failed to remove item", "error");
        }
      } else {
        // Find the book object
        const book = googleBooks.find(b => b.id === bookId) || books.find(b => b.id === bookId);
        if (book) {
          // Insert/upsert it into the database books table first
          const { error } = await upsertBook(book);
          if (error) {
            showToast("Failed to save book to database", "error");
            console.error("Error saving book:", error);
            return;
          }
          if (!books.some(b => b.id === bookId)) {
            setBooks(prev => [...prev, book]);
          }
        }
        const res = await upsertReadingListAction({
          book_id: bookId,
          status,
          progress_pages: 0,
          total_pages: 100, // Default pages (will be customizable in Reading List UI)
          is_favorite: false,
          notes: null,
        });
        if (res.success) {
          setReadingList({
            ...readingList,
            [bookId]: status,
          });
          showToast(`Marked as "${status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}"`, "success");
        } else {
          showToast(res.error || "Failed to update reading status", "error");
        }
      }
    } catch (e) {
      showToast("An unexpected error occurred", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setActiveTab("all");
  };

  // Filter books dynamically based on states
  const activeBooksSource = searchQuery.trim() ? googleBooks : books;

  const filteredBooks = activeBooksSource.filter((book) => {
    const matchesSearch = searchQuery.trim()
      ? true // Google Books already matches search query
      : (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "trending" && book.is_trending) ||
      (activeTab === "top-rated" && book.rating >= 4.5) ||
      (activeTab === "wishlist" && wishlist.includes(book.id));

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Featured Book (e.g. dynamic featured pick)
  const featuredBook = books.find(b => b.is_trending) || books[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2.5 rounded-xl border border-white/10 bg-neutral-900/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          {toast.type === "success" ? (
            <CheckCircle size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

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
              href="/feed"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Community Feed"
            >
              <MessageSquare size={18} />
            </Link>
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
            Explore our database catalog of leading self-improvement guides, deep technical literature, fiction blockbusters, and mindfulness classics.
          </p>
        </div>

        {/* Featured Book Banner */}
        {featuredBook && (
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm shadow-xl group hover:border-indigo-500/20 transition-all duration-500">
            <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 -mb-20 h-60 w-60 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

            <div className="relative grid gap-8 md:grid-cols-12 items-center">
              {/* Cover Column */}
              <div className="md:col-span-4 flex justify-center">
                <div 
                  onClick={() => setSelectedBook(featuredBook)}
                  className="relative w-44 h-64 md:w-52 md:h-76 shadow-2xl rounded-xl overflow-hidden transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  title="View details"
                >
                  <Image
                    src={featuredBook.image}
                    alt={featuredBook.title}
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
                <h2 
                  onClick={() => setSelectedBook(featuredBook)}
                  className="text-3xl md:text-4xl font-extrabold tracking-tight hover:text-indigo-400 transition cursor-pointer"
                  title="View details"
                >
                  {featuredBook.title}
                </h2>
                <p className="text-neutral-400 font-medium text-sm md:text-base">
                  by <span className="text-white hover:underline cursor-pointer">{featuredBook.author}</span> · {featuredBook.published_year}
                </p>
                <div className="flex items-center gap-4 text-xs md:text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-neutral-300 font-semibold border border-white/5">
                    {featuredBook.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Star size={16} fill="currentColor" />
                    {featuredBook.rating}
                  </span>
                  <span className="text-neutral-500">
                    ({featuredBook.reviews_count.toLocaleString()} reviews)
                  </span>
                </div>
                <p className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-xl">
                  {featuredBook.description}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setSelectedBook(featuredBook)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border border-transparent px-5 py-2.5 rounded-xl font-semibold transition text-sm text-white shadow-lg shadow-indigo-600/10"
                  >
                    <Sparkles size={14} />
                    View Details
                  </button>
                  <button 
                    onClick={() => toggleWishlist(featuredBook.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border text-sm ${
                      wishlist.includes(featuredBook.id)
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                        : "bg-white text-neutral-950 border-white hover:bg-white/90 hover:shadow-lg hover:shadow-white/5"
                    }`}
                  >
                    <Heart size={16} className={wishlist.includes(featuredBook.id) ? "fill-rose-400" : ""} />
                    {wishlist.includes(featuredBook.id) ? "In Wishlist" : "Add to Wishlist"}
                  </button>
                  <Link
                    href={`/reading-list`}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-5 py-2.5 rounded-xl font-semibold transition text-sm text-white"
                  >
                    <BookMarked size={16} />
                    View Reading List
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Toolbar: Search, Filters, Tabs */}
        <section className="space-y-6">
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

          {/* Category Pills */}
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

          {loading || searching ? (
            // Loading Skeletons
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-5 animate-pulse space-y-4">
                  <div className="h-48 w-full bg-white/5 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-white/10 rounded" />
                    <div className="h-5 w-2/3 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/10 rounded" />
                  </div>
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
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
                const currentStatus = readingList[book.id];

                return (
                  <li
                    key={book.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
                  >
                    <div className="absolute inset-0 border border-transparent group-hover:border-indigo-500/10 rounded-2xl transition duration-300 pointer-events-none" />

                    <div 
                      onClick={() => setSelectedBook(book)}
                      className="cursor-pointer"
                      title="View details"
                    >
                      {/* Image / Cover Wrapper */}
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
                          {currentStatus ? (
                            <span className="flex h-7 px-2.5 items-center justify-center rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-lg border border-indigo-500/30 bg-indigo-900/80 backdrop-blur-sm text-indigo-200">
                              <BookmarkCheck size={11} className="mr-1" />
                              {currentStatus.replace("-", " ")}
                            </span>
                          ) : (
                            <span className="flex h-7 px-2.5 items-center justify-center rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-lg border border-white/10 bg-neutral-950/75 text-neutral-300 backdrop-blur-sm">
                              Not reading
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(book.id);
                            }}
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
                            by {book.author} · {book.published_year}
                          </p>
                        </div>

                        <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="px-5 pb-5 pt-2 space-y-2">
                      {/* Reading Status Selector dropdown */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={currentStatus || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              handleUpdateReadingStatus(book.id, "remove");
                            } else {
                              handleUpdateReadingStatus(book.id, val as ReadingStatus);
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-xs px-3.5 py-2.5 rounded-xl text-neutral-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition [&>option]:bg-neutral-900"
                        >
                          <option value="">+ Add to Reading List</option>
                          <option value="want-to-read">Want to Read</option>
                          <option value="currently-reading">Currently Reading</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                          {currentStatus && <option value="">Remove from reading list</option>}
                        </select>
                      </div>

                      <Link
                        href={`/reviews?book=${book.id}`}
                        onClick={(e) => e.stopPropagation()}
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

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 text-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-950/60 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/10"
              aria-label="Close details"
            >
              <X size={18} />
            </button>

            {/* Left/Top Cover Panel */}
            <div className="md:w-2/5 bg-neutral-950/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 shrink-0">
              <div className="relative w-40 h-56 md:w-48 md:h-68 shadow-2xl rounded-xl overflow-hidden mb-4 border border-white/10">
                <Image
                  src={selectedBook.image}
                  alt={selectedBook.title}
                  fill
                  sizes="(max-width: 768px) 160px, 192px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="inline-block bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                {selectedBook.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                <span>{selectedBook.rating}</span>
                <span className="text-neutral-500 font-normal">
                  ({selectedBook.reviews_count.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Right/Main Content Panel */}
            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[80vh] md:max-h-none">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl pr-8">
                    {selectedBook.title}
                  </h2>
                  <p className="text-neutral-400 text-sm mt-1 font-medium">
                    by <span className="text-white">{selectedBook.author}</span> · {selectedBook.published_year}
                  </p>
                </div>

                {/* Keywords Tags */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Keywords / Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {getKeywordsFromDescription(selectedBook.description, selectedBook.category).map((keyword, i) => (
                      <span
                        key={i}
                        className="bg-white/5 border border-white/10 text-neutral-300 text-xs px-2.5 py-1 rounded-lg"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Synopsis
                  </h3>
                  <p className="text-neutral-300 text-xs md:text-sm leading-relaxed max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {selectedBook.description}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Wishlist Toggle */}
                  <button
                    onClick={() => toggleWishlist(selectedBook.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition text-xs border ${
                      wishlist.includes(selectedBook.id)
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                        : "bg-white text-neutral-950 border-white hover:bg-white/95"
                    }`}
                  >
                    <Heart size={14} className={wishlist.includes(selectedBook.id) ? "fill-rose-400" : ""} />
                    {wishlist.includes(selectedBook.id) ? "In Wishlist" : "Add to Wishlist"}
                  </button>

                  {/* Reading Status Selector dropdown */}
                  <div className="flex-1 relative">
                    <select
                      value={readingList[selectedBook.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          handleUpdateReadingStatus(selectedBook.id, "remove");
                        } else {
                          handleUpdateReadingStatus(selectedBook.id, val as ReadingStatus);
                        }
                      }}
                      className="w-full h-[38px] bg-white/5 border border-white/10 hover:border-white/20 text-xs px-3 py-2 rounded-xl text-neutral-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition [&>option]:bg-neutral-900"
                    >
                      <option value="">+ Add to Reading List</option>
                      <option value="want-to-read">Want to Read</option>
                      <option value="currently-reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                      {readingList[selectedBook.id] && <option value="">Remove from reading list</option>}
                    </select>
                  </div>
                </div>

                <Link
                  href={`/reviews?book=${selectedBook.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-2.5 text-xs font-semibold transition duration-300 text-white"
                >
                  Read Reviews & Write
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}