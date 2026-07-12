"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  User,
  Heart,
  Star,
  ArrowRight,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { getWishlist, getWishlistedBooks, removeFromWishlist as removeFromWishlistDb } from "../../../services/wishlist";
import { Book } from "../../../types/book";
import { getKeywordsFromDescription } from "../../../utils/helpers";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistedBooks, setWishlistedBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Load wishlist and book details from database on mount
  useEffect(() => {
    setMounted(true);
    async function loadWishlist() {
      try {
        setLoading(true);
        const dbWishlist = await getWishlist();
        setWishlist(dbWishlist);
        
        const dbBooks = await getWishlistedBooks();
        setWishlistedBooks(dbBooks);
      } catch (e) {
        console.error("Error reading wishlist from database", e);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const removeFromWishlist = async (bookId: string) => {
    // Optimistic update
    const updatedIds = wishlist.filter((id) => id !== bookId);
    setWishlist(updatedIds);
    setWishlistedBooks(wishlistedBooks.filter((book) => book.id !== bookId));
    await removeFromWishlistDb(bookId);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative">
      {/* Glow effect background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[35rem] w-[35rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[35rem] w-[35rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      {/* Global Header */}
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-400 flex items-center gap-1.5">
            <Heart size={12} className="fill-pink-500 text-pink-400" />
            Personal Library
          </span>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">
            My Wishlist
          </h1>
          <p className="mt-3 text-neutral-400 max-w-2xl leading-relaxed text-sm md:text-base">
            Keep track of titles you plan to explore next. Remove them as you read, or easily browse for reviews.
          </p>
        </div>

        {loading || !mounted ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : wishlistedBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8">
            <div className="p-4 rounded-full bg-white/5 text-neutral-500 mb-4">
              <Heart size={36} />
            </div>
            <h3 className="text-lg font-bold">Your Wishlist is Empty</h3>
            <p className="text-neutral-500 mt-2 text-sm max-w-xs leading-relaxed">
              You haven''t saved any books yet. Browse the catalog to discover and add books to your reading plans!
            </p>
            <Link
              href="/books"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-lg shadow-indigo-600/10"
            >
              Browse Catalog
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistedBooks.map((book) => (
              <div
                key={book.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  onClick={() => setSelectedBook(book)}
                  className="cursor-pointer"
                  title="View details"
                >
                  {/* Book Cover */}
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

                    {/* Top action buttons */}
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(book.id);
                        }}
                        className="p-2 rounded-lg bg-neutral-950/60 text-neutral-400 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
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
                <div className="px-5 pb-5 pt-2 flex gap-2">
                  <Link
                    href={`/reviews?book=${book.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-2.5 text-xs font-semibold transition duration-300 text-white"
                  >
                    Read Reviews
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      removeFromWishlist(selectedBook.id);
                      setSelectedBook(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition text-xs border bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                  >
                    <Trash2 size={14} />
                    Remove from Wishlist
                  </button>

                  <Link
                    href={`/reviews?book=${selectedBook.id}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 py-2.5 text-xs font-semibold transition duration-300 text-white"
                  >
                    Read Reviews
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}