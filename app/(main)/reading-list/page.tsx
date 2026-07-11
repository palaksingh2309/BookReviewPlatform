"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Settings,
  User,
  Search,
  Heart,
  BookMarked,
  SlidersHorizontal,
  X,
  Edit2,
  Trash2,
  TrendingUp,
  Award,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  BookOpenCheck,
  FileText,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { getReadingList, getReadingStats } from "../../../services/reading-list";
import { upsertReadingListAction, deleteReadingListAction } from "../../../actions/readingList";
import { readingListSchema, ReadingListInput } from "../../../lib/validators";
import { ReadingListEntry, ReadingStatus, ReadingStats } from "../../../types/book";

export default function ReadingListPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ReadingListEntry[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  
  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "title" | "progress">("updated_at");

  // Modal & Form States
  const [editingEntry, setEditingEntry] = useState<ReadingListEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReadingListInput>({
    resolver: zodResolver(readingListSchema),
    defaultValues: {
      status: "want-to-read",
      progress_pages: 0,
      total_pages: 100,
      is_favorite: false,
      notes: "",
    },
  });

  const currentStatus = watch("status");
  const progressPages = watch("progress_pages");
  const totalPages = watch("total_pages");

  // Sync progress if marked completed
  useEffect(() => {
    if (currentStatus === "completed" && totalPages > 0) {
      setValue("progress_pages", totalPages);
    }
  }, [currentStatus, totalPages, setValue]);

  // Load reading list and statistics
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: listData, error: listError } = await getReadingList();
      if (listError) throw listError;
      setEntries(listData || []);

      const { data: statsData, error: statsError } = await getReadingStats();
      if (!statsError) setStats(statsData);
    } catch (e: any) {
      showToast(e.message || "Failed to load reading list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditClick = (entry: ReadingListEntry) => {
    setEditingEntry(entry);
    reset({
      status: entry.status,
      progress_pages: entry.progress_pages,
      total_pages: entry.total_pages,
      is_favorite: entry.is_favorite,
      notes: entry.notes || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to remove this book from your reading list?")) return;
    try {
      const res = await deleteReadingListAction(bookId);
      if (res.success) {
        showToast("Book removed from reading list", "success");
        loadData();
      } else {
        showToast(res.error || "Failed to delete item", "error");
      }
    } catch (err) {
      showToast("An error occurred during deletion", "error");
    }
  };

  const handleFavoriteToggle = async (entry: ReadingListEntry) => {
    try {
      const res = await upsertReadingListAction({
        book_id: entry.book_id,
        status: entry.status,
        progress_pages: entry.progress_pages,
        total_pages: entry.total_pages,
        is_favorite: !entry.is_favorite,
        notes: entry.notes,
      });

      if (res.success) {
        showToast(entry.is_favorite ? "Removed from Favorites" : "Added to Favorites", "success");
        loadData();
      } else {
        showToast(res.error || "Failed to update favorite status", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  const onSubmitForm = async (data: ReadingListInput) => {
    if (!editingEntry) return;
    if (data.progress_pages > data.total_pages) {
      setFormError("Pages read cannot exceed total pages");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await upsertReadingListAction({
        book_id: editingEntry.book_id,
        status: data.status,
        progress_pages: data.progress_pages,
        total_pages: data.total_pages,
        is_favorite: data.is_favorite,
        notes: data.notes || null,
      });

      if (res.success) {
        showToast("Reading progress updated successfully!", "success");
        setIsModalOpen(false);
        setEditingEntry(null);
        loadData();
      } else {
        setFormError(res.error || "Failed to save reading list entry");
      }
    } catch (err) {
      setFormError("An unexpected server error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort Operations
  const filteredEntries = entries
    .filter((entry) => {
      const matchesSearch =
        entry.books?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.books?.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "updated_at") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === "title") {
        return (a.books?.title || "").localeCompare(b.books?.title || "");
      }
      if (sortBy === "progress") {
        const percentA = a.total_pages > 0 ? a.progress_pages / a.total_pages : 0;
        const percentB = b.total_pages > 0 ? b.progress_pages / b.total_pages : 0;
        return percentB - percentA;
      }
      return 0;
    });

  const getStatusBadgeClass = (status: ReadingStatus) => {
    switch (status) {
      case "currently-reading":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-400/20";
      case "want-to-read":
        return "bg-amber-500/10 text-amber-300 border-amber-400/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
      case "dropped":
        return "bg-red-500/10 text-red-300 border-red-400/20";
      default:
        return "bg-white/5 text-neutral-400 border-white/5";
    }
  };

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

      {/* Glow Backdrops */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-pink-600/10 blur-[130px]" />
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Title Header */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Personal Space
          </span>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Reading Tracker
          </h1>
          <p className="mt-3 text-neutral-400 max-w-2xl leading-relaxed text-sm md:text-base">
            Log pages, save detailed notes, favorite standout chapters, and keep track of your goals.
          </p>
        </div>

        {/* Statistics Dashboard Section */}
        {stats && (
          <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              {
                label: "Books Completed",
                value: stats.booksCompleted,
                desc: `${stats.booksCurrentlyReading} currently reading`,
                icon: BookOpenCheck,
              },
              {
                label: "Pages Logged",
                value: stats.totalPagesRead.toLocaleString(),
                desc: `${stats.booksDropped} dropped books`,
                icon: FileText,
              },
              {
                label: "Reading Streak",
                value: `${stats.streakDays} Days`,
                desc: stats.streakDays > 0 ? "Keep it up!" : "Start reading today!",
                icon: TrendingUp,
              },
              {
                label: "Total tracked",
                value: stats.totalBooks,
                desc: `${stats.booksWantToRead} want to read`,
                icon: Award,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-md flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-neutral-400 font-medium">{stat.desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-neutral-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/10 transition">
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Control Toolbar */}
        <section className="flex flex-col gap-4 md:flex-row md:items-center justify-between border-t border-white/5 pt-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search title, author, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status select filter */}
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-neutral-300 shrink-0">
              <SlidersHorizontal size={12} className="text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer [&>option]:bg-neutral-900 font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="want-to-read">Want to Read</option>
                <option value="currently-reading">Currently Reading</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-neutral-300 shrink-0">
              <span className="text-neutral-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer [&>option]:bg-neutral-900 font-semibold"
              >
                <option value="updated_at">Recently Updated</option>
                <option value="title">Book Title</option>
                <option value="progress">Reading Progress</option>
              </select>
            </div>
          </div>
        </section>

        {/* Reading List Entries Grid */}
        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl border border-white/5 bg-white/5 p-6 animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="h-28 w-20 bg-white/10 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-white/10 rounded w-full" />
                    <div className="h-8 bg-white/10 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8">
              <div className="p-4 rounded-full bg-white/5 text-neutral-500 mb-4">
                <BookMarked size={36} />
              </div>
              <h3 className="text-lg font-bold">Your reading list is empty</h3>
              <p className="text-neutral-500 mt-2 text-sm max-w-sm">
                Search books in the catalog and add them to track your progress, save notes, and calculate stats.
              </p>
              <Link
                href="/books"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-lg shadow-indigo-600/10"
              >
                <Plus size={16} />
                Explore Books Catalog
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {filteredEntries.map((entry) => {
                const book = entry.books;
                if (!book) return null;

                const progressPercent =
                  entry.total_pages > 0
                    ? Math.min(Math.round((entry.progress_pages / entry.total_pages) * 100), 100)
                    : 0;

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500/20 hover:bg-white/[0.07] transition-all duration-300 shadow-md group"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Row: Cover and Info */}
                      <div className="flex gap-4 items-start">
                        <div className="relative w-18 h-26 rounded-lg overflow-hidden shrink-0 shadow-lg bg-neutral-900 border border-white/5">
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <span className={`inline-block border rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${getStatusBadgeClass(entry.status)}`}>
                              {entry.status.replace("-", " ")}
                            </span>
                            <button
                              onClick={() => handleFavoriteToggle(entry)}
                              className={`p-1.5 rounded-lg border transition ${
                                entry.is_favorite
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30"
                                  : "bg-transparent text-neutral-500 border-white/10 hover:text-white"
                              }`}
                              title={entry.is_favorite ? "Remove from Favorites" : "Mark as Favorite"}
                            >
                              <Heart size={14} className={entry.is_favorite ? "fill-rose-400" : ""} />
                            </button>
                          </div>
                          <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-neutral-400 truncate">
                            by {book.author}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Updated {new Date(entry.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-neutral-400">Progress</span>
                          <span className="text-indigo-300">
                            {entry.progress_pages} / {entry.total_pages} pages ({progressPercent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Notes Box */}
                      {entry.notes && (
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                            <FileText size={10} />
                            Notes
                          </div>
                          <p className="text-xs text-neutral-300 italic line-clamp-2 leading-relaxed">
                            "{entry.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="px-5 pb-5 pt-1.5 flex gap-2 border-t border-white/5">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-600/30 py-2.5 text-xs font-semibold transition duration-300 text-white"
                      >
                        <Edit2 size={12} />
                        Update Progress
                      </button>
                      <button
                        onClick={() => handleDelete(entry.book_id)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 transition duration-300"
                        title="Remove book"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Edit Form Modal */}
      {isModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8 shadow-2xl animate-scale-in">
            {/* Background glows inside modal */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Update Reading Progress
                </h3>
                <p className="text-xs text-neutral-400 mt-1 truncate max-w-[280px]">
                  {editingEntry.books?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                }}
                className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-neutral-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200">
                <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 relative">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Reading Status</label>
                <select
                  {...register("status")}
                  className="w-full bg-black/40 border border-white/15 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer transition [&>option]:bg-neutral-900"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="currently-reading">Currently Reading</option>
                  <option value="completed">Completed (Auto Syncs Pages)</option>
                  <option value="dropped">Dropped</option>
                </select>
                {errors.status && (
                  <p className="text-[10px] text-red-400">{errors.status.message}</p>
                )}
              </div>

              {/* Progress and Total Pages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Pages Read</label>
                  <input
                    type="number"
                    disabled={currentStatus === "completed"}
                    {...register("progress_pages", { valueAsNumber: true })}
                    className="w-full bg-black/40 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.progress_pages && (
                    <p className="text-[10px] text-red-400">{errors.progress_pages.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Total Pages</label>
                  <input
                    type="number"
                    {...register("total_pages", { valueAsNumber: true })}
                    className="w-full bg-black/40 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  />
                  {errors.total_pages && (
                    <p className="text-[10px] text-red-400">{errors.total_pages.message}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Log Notes</label>
                <textarea
                  rows={3}
                  placeholder="Share a favorite quote or review notes for your records..."
                  {...register("notes")}
                  className="w-full bg-black/40 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none transition"
                />
                {errors.notes && (
                  <p className="text-[10px] text-red-400">{errors.notes.message}</p>
                )}
              </div>

              {/* Favorite toggle inside form */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form_is_favorite"
                  {...register("is_favorite")}
                  className="h-4 w-4 rounded border-white/15 bg-black/40 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
                <label htmlFor="form_is_favorite" className="text-xs font-medium text-neutral-300 select-none cursor-pointer flex items-center gap-1.5">
                  <Heart size={12} className="text-rose-400 fill-rose-400/30" />
                  Mark as favorite book
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-3 text-xs font-semibold transition text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed py-3 text-xs font-semibold transition text-white shadow-lg shadow-indigo-600/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Log Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}