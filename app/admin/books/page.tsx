"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Globe, 
  Bookmark, 
  Calendar, 
  User, 
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  X,
  UploadCloud
} from "lucide-react";

import { 
  getBooksAction, 
  upsertBookAction, 
  deleteBookAction, 
  searchGoogleBooksAction,
  getGenresAction
} from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  published_year: number;
  image: string;
  description: string;
  is_trending: boolean;
  is_top_rated: boolean;
  is_featured: boolean;
  rating?: number;
  reviews_count?: number;
}

interface Genre {
  id: string;
  name: string;
  slug: string;
}

export default function BooksCrudPage() {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Form modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);

  // Google Books import drawer state
  const [isGoogleDrawerOpen, setIsGoogleDrawerOpen] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [googleResults, setGoogleResults] = useState<Partial<Book>[]>([]);
  const [isGoogleSearching, setIsGoogleSearching] = useState(false);

  // Delete confirm modal state
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load books and genres on filters update
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [booksRes, genresRes] = await Promise.all([
          getBooksAction({
            search,
            category,
            page: currentPage,
          }),
          getGenresAction()
        ]);

        if (booksRes.success && booksRes.books) {
          setBooks(booksRes.books as Book[]);
          setTotalPages(booksRes.totalPages || 1);
          setTotalCount(booksRes.totalCount || 0);
        }

        if (genresRes.success && genresRes.genres) {
          setGenres(genresRes.genres as Genre[]);
        }
      } catch (err) {
        toast({
          title: "Database connection failed",
          description: "Could not fetch catalogs.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, currentPage, toast]);

  // Handle pagination page change
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Google Books API query
  async function handleGoogleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!googleSearchQuery) return;

    setIsGoogleSearching(true);
    try {
      const res = await searchGoogleBooksAction(googleSearchQuery);
      if (res.success && res.items) {
        setGoogleResults(res.items);
      } else {
        toast({
          title: "Search failed",
          description: res.error || "Google API error.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Google Books API is unreachable.",
        type: "error",
      });
    } finally {
      setIsGoogleSearching(false);
    }
  }

  // Pre-fill form from Google Books result
  function handleImportBook(googleBook: Partial<Book>) {
    setEditingBook({
      title: googleBook.title,
      author: googleBook.author,
      category: googleBook.category || "Fiction",
      published_year: googleBook.published_year || new Date().getFullYear(),
      image: googleBook.image,
      description: googleBook.description,
      is_featured: false,
      is_trending: false,
      is_top_rated: false,
    });
    setIsGoogleDrawerOpen(false);
    setIsFormOpen(true);
    toast({
      title: "Data Imported",
      description: `Pre-filled form with "${googleBook.title}". Please verify the details.`,
      type: "success",
    });
  }

  // Submit book Add/Edit form
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBook || !editingBook.title || !editingBook.author) return;

    startTransition(async () => {
      try {
        const res = await upsertBookAction({
          id: editingBook.id,
          title: editingBook.title || "",
          author: editingBook.author || "",
          category: editingBook.category || "Fiction",
          published_year: Number(editingBook.published_year) || new Date().getFullYear(),
          image: editingBook.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300",
          description: editingBook.description || "",
          is_featured: !!editingBook.is_featured,
          is_trending: !!editingBook.is_trending,
          is_top_rated: !!editingBook.is_top_rated,
        });

        if (res.success && res.book) {
          toast({
            title: "Success",
            description: `Book "${editingBook.title}" has been saved.`,
            type: "success",
          });

          // Update local state
          const savedBook = res.book as Book;
          if (editingBook.id) {
            setBooks((prev) => prev.map((b) => (b.id === savedBook.id ? savedBook : b)));
          } else {
            setBooks((prev) => [savedBook, ...prev]);
            setTotalCount((c) => c + 1);
          }
          setIsFormOpen(false);
          setEditingBook(null);
        } else {
          toast({
            title: "Form submission failed",
            description: res.error || "Please check validation rules.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Database transaction failed.",
          type: "error",
        });
      }
    });
  }

  // Confirm and delete book
  async function handleDeleteConfirm() {
    if (!deletingBookId) return;

    startTransition(async () => {
      try {
        const res = await deleteBookAction(deletingBookId);
        if (res.success) {
          toast({
            title: "Book deleted",
            description: "The catalog entry has been removed.",
            type: "success",
          });
          setBooks((prev) => prev.filter((b) => b.id !== deletingBookId));
          setTotalCount((c) => c - 1);
        } else {
          toast({
            title: "Delete failed",
            description: res.error || "RLS constraint block.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not execute query.",
          type: "error",
        });
      } finally {
        setDeletingBookId(null);
      }
    });
  }

  // Quick toggle feature switches
  async function handleToggleFeature(book: Book, flag: "is_featured" | "is_trending" | "is_top_rated", value: boolean) {
    try {
      const updates = {
        ...book,
        [flag]: value
      };
      
      const res = await upsertBookAction(updates);
      if (res.success) {
        toast({
          title: "Book updated",
          description: `Featuring flag updated successfully.`,
          type: "success",
        });
        setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, [flag]: value } : b)));
      }
    } catch {
      toast({
        title: "Toggle failed",
        description: "Could not complete request.",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans relative">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Books Catalog</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Search, insert, update, or remove volumes in the sitewide catalog.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsGoogleDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-4 py-2.5 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/5"
          >
            <Globe size={14} />
            Import from Google
          </button>
          <button
            onClick={() => {
              setEditingBook({
                title: "",
                author: "",
                category: "Fiction",
                published_year: new Date().getFullYear(),
                image: "",
                description: "",
                is_featured: false,
                is_trending: false,
                is_top_rated: false,
              });
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <Plus size={14} />
            Add Book
          </button>
        </div>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 placeholder:text-neutral-600"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none transition focus:border-indigo-400/50"
        >
          <option value="all" className="bg-neutral-900 text-white">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.name} className="bg-neutral-900 text-white">
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Books listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching volumes...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No books found matching search filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">Book</th>
                  <th className="py-4.5 px-6">Genre</th>
                  <th className="py-4.5 px-6">Year</th>
                  <th className="py-4.5 px-6">Featured</th>
                  <th className="py-4.5 px-6">Trending</th>
                  <th className="py-4.5 px-6">Top Rated</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Cover & Title */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="h-14 w-10 object-cover rounded shadow-md shrink-0 bg-neutral-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-xs">{b.title}</p>
                        <p className="text-xs text-neutral-500 font-sans mt-0.5">{b.author}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {b.category}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="py-4 px-6 font-mono text-neutral-400 text-xs">
                      {b.published_year}
                    </td>

                    {/* Feature Toggles */}
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={b.is_featured}
                        onChange={(e) => handleToggleFeature(b, "is_featured", e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      />
                    </td>

                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={b.is_trending}
                        onChange={(e) => handleToggleFeature(b, "is_trending", e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      />
                    </td>

                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={b.is_top_rated}
                        onChange={(e) => handleToggleFeature(b, "is_top_rated", e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right shrink-0">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBook(b);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg inline-flex cursor-pointer"
                          title="Edit Book"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingBookId(b.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                          title="Delete Book"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-6 py-4">
              <span className="text-xs text-neutral-500 font-sans">
                Showing Page {currentPage} of {totalPages} ({totalCount} total books)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Books Search sliding drawer (right sidebar) */}
      {isGoogleDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsGoogleDrawerOpen(false)}
          />

          {/* Panel content */}
          <div className="relative w-full max-w-lg bg-neutral-900 border-l border-white/10 p-6 flex flex-col justify-between z-10 shadow-2xl h-full overflow-y-auto animate-slide-in">
            <div className="space-y-6 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Globe className="text-indigo-400" size={18} />
                  Google Books Importer
                </h3>
                <button
                  onClick={() => setIsGoogleDrawerOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Search query */}
              <form onSubmit={handleGoogleSearch} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Search Google database (e.g. Orwell 1984)..."
                  value={googleSearchQuery}
                  onChange={(e) => setGoogleSearchQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-400/50"
                />
                <button
                  type="submit"
                  disabled={isGoogleSearching}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs text-white shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isGoogleSearching ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Search"}
                </button>
              </form>

              {/* Search result list */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4">
                {isGoogleSearching ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  </div>
                ) : googleResults.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-sans text-center py-16 leading-relaxed">
                    Search above to retrieve volume titles directly from Google's database. Click import to prefill.
                  </p>
                ) : (
                  googleResults.map((gb, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/5 bg-white/2 p-4 flex gap-4 items-start hover:bg-white/5 transition-all"
                    >
                      <img
                        src={gb.image}
                        alt={gb.title}
                        className="h-16 w-12 object-cover rounded shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300";
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-bold text-white truncate">{gb.title}</p>
                        <p className="text-xs text-neutral-400 font-semibold">{gb.author}</p>
                        <p className="text-[10px] text-neutral-600 truncate font-sans">
                          {gb.category} • {gb.published_year}
                        </p>
                        <button
                          onClick={() => handleImportBook(gb)}
                          className="mt-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded cursor-pointer"
                        >
                          Import Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book details Dialog Form modal */}
      {isFormOpen && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h3 className="font-display text-md font-bold flex items-center gap-2">
                <Bookmark className="text-indigo-400" size={16} />
                {editingBook.id ? `Edit Book Details` : `Add New Catalog Entry`}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingBook(null);
                }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Title</label>
                  <input
                    type="text"
                    required
                    value={editingBook.title || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Author</label>
                  <input
                    type="text"
                    required
                    value={editingBook.author || ""}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                  />
                </div>

                {/* Genre Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Category/Genre</label>
                  <select
                    value={editingBook.category || "Fiction"}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.name} className="bg-neutral-900 text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Published Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Published Year</label>
                  <input
                    type="number"
                    required
                    value={editingBook.published_year || new Date().getFullYear()}
                    onChange={(e) => setEditingBook({ ...editingBook, published_year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/cover.jpg"
                  value={editingBook.image || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, image: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 font-sans"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Summary/Description</label>
                <textarea
                  rows={4}
                  value={editingBook.description || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Switches */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingBook.is_featured}
                    onChange={(e) => setEditingBook({ ...editingBook, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingBook.is_trending}
                    onChange={(e) => setEditingBook({ ...editingBook, is_trending: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                  />
                  Trending
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingBook.is_top_rated}
                    onChange={(e) => setEditingBook({ ...editingBook, is_top_rated: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/20 text-indigo-600"
                  />
                  Top Rated
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingBookId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-400" size={20} />
              Confirm Delete
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to delete this volume? This action will permanently remove it from the catalog and delete all associated reviews.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeletingBookId(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all cursor-pointer"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
