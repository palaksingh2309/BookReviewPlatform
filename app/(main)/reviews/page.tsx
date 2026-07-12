"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Settings,
  User,
  Star,
  ThumbsUp,
  Trash2,
  AlertTriangle,
  Eye,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import { getBooks, getBookById } from "../../../services/books";
import { getReviewsForBook, getUserReviewForBook, getReviewAnalytics } from "../../../services/reviews";
import { upsertReviewAction, deleteReviewAction, toggleLikeReviewAction } from "../../../actions/reviews";
import { reviewSchema, ReviewInput } from "../../../lib/validators";
import { Book } from "../../../types/book";
import { Review, ReviewAnalytics } from "../../../types/review";

function ReviewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("book");

  // State
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [currentUserUuid, setCurrentUserUuid] = useState<string | null>(null);

  // Form & UI States
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Setup Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      content: "",
      is_spoiler: false,
    },
  });

  const ratingVal = watch("rating");

  // Load books catalog and current details
  useEffect(() => {
    setMounted(true);
    async function initPage() {
      try {
        setLoading(true);
        // Load book list for selector
        const { data: dbBooks } = await getBooks();
        setBooksList(dbBooks || []);

        // Load current auth user uuid
        const { supabase } = await import("../../../lib/supabase");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserUuid(user.id);

        if (bookId) {
          const { data: dbBook } = await getBookById(bookId);
          setSelectedBook(dbBook);

          if (dbBook) {
            // Load reviews
            const { data: dbReviews } = await getReviewsForBook(bookId);
            setReviews(dbReviews || []);

            // Load analytics
            const { data: dbAnalytics } = await getReviewAnalytics(bookId);
            setAnalytics(dbAnalytics);

            // Load user review
            const { data: dbUserRev } = await getUserReviewForBook(bookId);
            setUserReview(dbUserRev);
            if (dbUserRev) {
              reset({
                rating: dbUserRev.rating,
                content: dbUserRev.content,
                is_spoiler: dbUserRev.is_spoiler,
              });
            } else {
              reset({
                rating: 5,
                content: "",
                is_spoiler: false,
              });
            }
          }
        } else {
          setSelectedBook(null);
          setReviews([]);
          setAnalytics(null);
          setUserReview(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, [bookId, reset]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookChange = (id: string) => {
    if (id) {
      router.push(`/reviews?book=${id}`);
    } else {
      router.push("/reviews");
    }
  };

  const handleRatingSelect = (stars: number) => {
    setValue("rating", stars);
  };

  const handleLike = async (reviewId: string) => {
    if (!currentUserUuid) {
      showToast("Log in to like reviews", "error");
      return;
    }
    try {
      const res = await toggleLikeReviewAction(reviewId);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.id === reviewId) {
              const diff = res.liked ? 1 : -1;
              return {
                ...r,
                likes_count: Math.max(0, r.likes_count + diff),
                user_has_liked: res.liked,
              };
            }
            return r;
          })
        );
        showToast(res.liked ? "Review Liked!" : "Review Unliked", "success");
      } else {
        showToast(res.error || "Failed to update like status", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  const toggleSpoiler = (reviewId: string) => {
    setRevealedSpoilers((prev) => {
      const updated = new Set(prev);
      if (updated.has(reviewId)) updated.delete(reviewId);
      else updated.add(reviewId);
      return updated;
    });
  };

  const handleDeleteReview = async () => {
    if (!bookId) return;
    if (!confirm("Are you sure you want to delete your review? This will also update the average rating of this book.")) return;

    try {
      const res = await deleteReviewAction(bookId);
      if (res.success) {
        showToast("Review deleted successfully", "success");
        setUserReview(null);
        reset({
          rating: 5,
          content: "",
          is_spoiler: false,
        });
        
        // Refresh reviews list
        const { data: dbReviews } = await getReviewsForBook(bookId);
        setReviews(dbReviews || []);

        const { data: dbAnalytics } = await getReviewAnalytics(bookId);
        setAnalytics(dbAnalytics);
      } else {
        showToast(res.error || "Failed to delete review", "error");
      }
    } catch (err) {
      showToast("An error occurred during deletion", "error");
    }
  };

  const onSubmitReview = async (data: ReviewInput) => {
    if (!bookId) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await upsertReviewAction({
        book_id: bookId,
        rating: data.rating,
        content: data.content,
        is_spoiler: data.is_spoiler,
      });

      if (res.success) {
        showToast(userReview ? "Review updated!" : "Review submitted!", "success");
        setIsWriteOpen(false);
        
        // Refresh reviews, analytics, and userReview
        const { data: dbReviews } = await getReviewsForBook(bookId);
        setReviews(dbReviews || []);

        const { data: dbAnalytics } = await getReviewAnalytics(bookId);
        setAnalytics(dbAnalytics);

        const { data: dbUserRev } = await getUserReviewForBook(bookId);
        setUserReview(dbUserRev);
      } else {
        setFormError(res.error || "Failed to submit review");
      }
    } catch (err) {
      setFormError("An unexpected server error occurred.");
    } finally {
      setSubmitting(false);
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8 animate-fade-in">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Community Space
            </span>
            <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">
              Book Reviews
            </h1>
          </div>

          {/* Book selector */}
          <div className="flex items-center gap-2 max-w-xs w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-neutral-300">
            <BookOpen size={16} className="text-neutral-500 shrink-0" />
            <select
              value={bookId || ""}
              onChange={(e) => handleBookChange(e.target.value)}
              className="w-full bg-transparent focus:outline-none cursor-pointer text-sm font-semibold [&>option]:bg-neutral-900"
            >
              <option value="">Select a book...</option>
              {booksList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-sm text-neutral-500">Loading catalog reviews...</p>
          </div>
        ) : !selectedBook ? (
          // Empty state: Choose a book
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8">
            <div className="p-4 rounded-full bg-white/5 text-neutral-500 mb-4">
              <MessageSquare size={36} />
            </div>
            <h3 className="text-lg font-bold">No Book Selected</h3>
            <p className="text-neutral-400 mt-2 text-sm max-w-sm">
              Please choose a book from the selector above or browse our catalog page to read its reviews and share your feedback.
            </p>
            <Link
              href="/books"
              className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-lg shadow-indigo-600/10"
            >
              <ChevronLeft size={16} />
              Back to Catalog
            </Link>
          </div>
        ) : (
          // Book Reviews Active View
          <div className="space-y-8">
            {/* Book Quick Info and Review Stats Summary */}
            <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-start">
              {/* Left Column: Book Details Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-md space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-lg bg-neutral-900 border border-white/5">
                    <Image
                      src={selectedBook.image}
                      alt={selectedBook.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded-full font-bold">
                      {selectedBook.category}
                    </span>
                    <h2 className="font-display text-lg font-bold leading-snug line-clamp-2">
                      {selectedBook.title}
                    </h2>
                    <p className="text-xs text-neutral-400">
                      by {selectedBook.author} · {selectedBook.published_year}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-wrap gap-3">
                  {userReview ? (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>Your Rated Score:</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Star size={13} fill="currentColor" />
                          {userReview.rating} / 5
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsWriteOpen(true)}
                          className="flex-1 rounded-xl bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-600/20 py-2.5 text-xs font-semibold transition text-white"
                        >
                          Edit Review
                        </button>
                        <button
                          onClick={handleDeleteReview}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 transition"
                          title="Delete review"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsWriteOpen(true)}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold transition text-white shadow-lg shadow-indigo-600/10"
                    >
                      Write Review & Rating
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Ratings Analytics Card */}
              {analytics && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-md grid gap-6 sm:grid-cols-[1fr_2fr]">
                  {/* Left: Overall rating big number */}
                  <div className="flex flex-col justify-center items-center text-center p-4 border-r border-white/5 sm:border-r">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                      Average Rating
                    </p>
                    <p className="text-5xl font-black text-white mt-2 font-sans tracking-tight">
                      {analytics.averageRating}
                    </p>
                    <div className="flex gap-0.5 text-amber-400 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const filled = s <= Math.round(analytics.averageRating);
                        return (
                          <Star
                            key={s}
                            size={16}
                            fill={filled ? "currentColor" : "none"}
                            className={filled ? "text-amber-400" : "text-neutral-600"}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-neutral-400 mt-3 font-medium">
                      Based on {analytics.totalReviews} reviews
                    </p>
                  </div>

                  {/* Right: Distribution chart */}
                  <div className="space-y-2.5 justify-center flex flex-col">
                    {analytics.distribution.map((dist) => (
                      <div key={dist.rating} className="flex items-center gap-3 text-xs font-semibold">
                        <span className="w-12 text-neutral-400 hover:text-white cursor-pointer shrink-0 flex items-center gap-1 justify-end">
                          {dist.rating} <Star size={11} fill="currentColor" className="text-amber-400" />
                        </span>
                        <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-indigo-300 font-bold shrink-0">
                          {dist.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews List Column */}
            <div className="space-y-5">
              <h3 className="font-display font-bold text-lg border-b border-white/5 pb-2">
                All Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-6">
                  <p className="text-neutral-500 text-sm">
                    No reviews written yet. Be the first to share your thoughts on "{selectedBook.title}"!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const isMyReview = rev.user_id === currentUserUuid;
                    const hasSpoiler = rev.is_spoiler;
                    const revealed = revealedSpoilers.has(rev.id);

                    return (
                      <div
                        key={rev.id}
                        className={`rounded-2xl border p-5 transition-all duration-300 shadow-md ${
                          isMyReview
                            ? "border-indigo-500/25 bg-indigo-500/[0.03]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          {/* Profile & Rating */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-[10px] font-bold text-white uppercase">
                                {(rev.profiles?.username || "R").substring(0, 2)}
                              </span>
                              <span className="text-sm font-bold text-white">
                                {rev.profiles?.full_name || rev.profiles?.username || "Anonymous"}
                              </span>
                              {isMyReview && (
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                              <div className="flex gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    fill={s <= rev.rating ? "currentColor" : "none"}
                                    className={s <= rev.rating ? "text-amber-400" : "text-neutral-700"}
                                  />
                                ))}
                              </div>
                              <span>·</span>
                              <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Likes Button */}
                          <button
                            onClick={() => handleLike(rev.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                              rev.user_has_liked
                                ? "bg-indigo-600/20 border-indigo-600/30 text-indigo-300 hover:bg-indigo-600/30"
                                : "bg-white/5 border-white/10 hover:border-white/25 text-neutral-400 hover:text-white"
                            }`}
                          >
                            <ThumbsUp size={12} className={rev.user_has_liked ? "fill-indigo-400" : ""} />
                            <span>{rev.likes_count}</span>
                          </button>
                        </div>

                        {/* Content text */}
                        <div className="mt-4">
                          {hasSpoiler && !revealed ? (
                            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-yellow-200">
                              <div className="flex items-center gap-2.5 text-xs font-semibold">
                                <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                                <span>This review contains spoilers.</span>
                              </div>
                              <button
                                onClick={() => toggleSpoiler(rev.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-bold text-yellow-300 transition shrink-0"
                              >
                                <Eye size={12} />
                                Reveal Review
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {hasSpoiler && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
                                  <AlertTriangle size={9} />
                                  Spoiler Revealed
                                </span>
                              )}
                              <p className="text-sm text-neutral-300 leading-relaxed font-sans select-text whitespace-pre-line">
                                {rev.content}
                              </p>
                              {hasSpoiler && revealed && (
                                <button
                                  onClick={() => toggleSpoiler(rev.id)}
                                  className="text-[10px] font-bold text-neutral-500 hover:text-white transition underline cursor-pointer mt-2"
                                >
                                  Hide Spoiler
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Review Dialog Modal */}
      {isWriteOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8 shadow-2xl animate-scale-in">
            {/* background blur */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-5 relative">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {userReview ? "Edit Your Review" : "Write a Review"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 truncate max-w-[280px]">
                  {selectedBook.title}
                </p>
              </div>
              <button
                onClick={() => setIsWriteOpen(false)}
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

            <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4 relative">
              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Select Rating Score</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleRatingSelect(s)}
                      className="p-1 hover:scale-110 transition text-amber-400"
                    >
                      <Star
                        size={28}
                        fill={s <= ratingVal ? "currentColor" : "none"}
                        className={s <= ratingVal ? "text-amber-400 animate-pulse-subtle" : "text-neutral-600"}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-[10px] text-red-400">{errors.rating.message}</p>
                )}
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Review Comments</label>
                <textarea
                  rows={4}
                  placeholder="Share what you liked, disliked, or what key lessons stood out to you. Must be at least 10 characters."
                  {...register("content")}
                  className="w-full bg-black/40 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none transition"
                />
                {errors.content && (
                  <p className="text-[10px] text-red-400">{errors.content.message}</p>
                )}
              </div>

              {/* Spoiler check */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form_is_spoiler"
                  {...register("is_spoiler")}
                  className="h-4 w-4 rounded border-white/15 bg-black/40 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
                <label htmlFor="form_is_spoiler" className="text-xs font-medium text-neutral-300 select-none cursor-pointer flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-yellow-500" />
                  Contains spoilers (hides text by default)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsWriteOpen(false)}
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
                      Saving...
                    </>
                  ) : (
                    "Publish Review"
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

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  );
}