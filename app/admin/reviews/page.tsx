"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Trash2, 
  Loader2, 
  MessageSquare, 
  Star, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flame
} from "lucide-react";

import { getReviewsAction, moderateReviewAction, deleteReviewAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  content: string;
  is_spoiler: boolean;
  is_featured: boolean;
  is_hidden: boolean;
  likes_count: number;
  created_at: string;
  profiles?: {
    username: string;
  } | null;
  books?: {
    title: string;
  } | null;
}

export default function ReviewsModerationPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [filterHidden, setFilterHidden] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Delete review state
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load reviews on filter changes
  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const isFeatured = filterFeatured === "featured" ? true : filterFeatured === "not-featured" ? false : undefined;
        const isHidden = filterHidden === "hidden" ? true : filterHidden === "visible" ? false : undefined;

        const result = await getReviewsAction({
          search,
          isFeatured,
          isHidden,
          page: currentPage,
        });

        if (result.success && result.reviews) {
          setReviews(result.reviews as Review[]);
          setTotalPages(result.totalPages || 1);
          setTotalCount(result.totalCount || 0);
        } else {
          toast({
            title: "Failed to load reviews",
            description: result.error || "Please verify database connection.",
            type: "error",
          });
        }
      } catch (err) {
        toast({
          title: "Network error",
          description: "Database is unreachable.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadReviews();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterFeatured, filterHidden, currentPage, toast]);

  // Handle pagination changes
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Handle moderate toggle actions (feature or hide reviews)
  async function handleToggleField(review: Review, field: "is_featured" | "is_hidden", value: boolean) {
    try {
      const updates = { [field]: value };
      const res = await moderateReviewAction(review.id, updates);

      if (res.success) {
        toast({
          title: "Success",
          description: `Review moderation status updated.`,
          type: "success",
        });

        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, [field]: value } : r))
        );
      } else {
        toast({
          title: "Moderation failed",
          description: res.error || "Please check permissions.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not execute server action.",
        type: "error",
      });
    }
  }

  // Confirm delete review
  async function handleDeleteConfirm() {
    if (!deletingReviewId) return;

    startTransition(async () => {
      try {
        const res = await deleteReviewAction(deletingReviewId);
        if (res.success) {
          toast({
            title: "Deleted",
            description: "The review has been permanently removed.",
            type: "success",
          });
          setReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));
          setTotalCount((c) => c - 1);
        } else {
          toast({
            title: "Delete failed",
            description: res.error || "Constraint block.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Could not complete operation.",
          type: "error",
        });
      } finally {
        setDeletingReviewId(null);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Reviews Moderation</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Monitor user book reviews. Feature top-quality ratings, hide spoilers/inappropriate content, or delete posts.
        </p>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search reviews by content keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 placeholder:text-neutral-600"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterFeatured}
            onChange={(e) => {
              setFilterFeatured(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Feature states</option>
            <option value="featured" className="bg-neutral-900 text-white">Featured Only</option>
            <option value="not-featured" className="bg-neutral-900 text-white">Not Featured</option>
          </select>

          <select
            value={filterHidden}
            onChange={(e) => {
              setFilterHidden(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Visibilities</option>
            <option value="visible" className="bg-neutral-900 text-white">Visible Only</option>
            <option value="hidden" className="bg-neutral-900 text-white">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No reviews matched the search criteria.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">User / Book</th>
                  <th className="py-4.5 px-6">Rating</th>
                  <th className="py-4.5 px-6 w-96">Content Summary</th>
                  <th className="py-4.5 px-6">Featured</th>
                  <th className="py-4.5 px-6">Hidden</th>
                  <th className="py-4.5 px-6 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User and Book */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-white">@{r.profiles?.username || "unknown"}</p>
                      <p className="text-xs text-neutral-500 font-semibold mt-0.5">{r.books?.title || "Book Title"}</p>
                    </td>

                    {/* Rating stars */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < r.rating ? "currentColor" : "none"}
                            className={i < r.rating ? "" : "text-neutral-700"}
                          />
                        ))}
                      </div>
                      {r.is_spoiler && (
                        <span className="inline-flex mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans uppercase tracking-wider">
                          Spoiler Alert
                        </span>
                      )}
                    </td>

                    {/* Review text snippet */}
                    <td className="py-4 px-6 font-sans text-xs text-neutral-400 leading-relaxed max-w-sm truncate whitespace-normal">
                      {r.content}
                    </td>

                    {/* Featured Checkbox */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleField(r, "is_featured", !r.is_featured)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          r.is_featured 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                            : "text-neutral-500 hover:text-white border-transparent hover:bg-white/5"
                        } cursor-pointer`}
                        title={r.is_featured ? "Remove Featured" : "Mark as Featured"}
                      >
                        <Flame size={14} fill={r.is_featured ? "currentColor" : "none"} />
                      </button>
                    </td>

                    {/* Hidden Toggle */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleField(r, "is_hidden", !r.is_hidden)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          r.is_hidden 
                            ? "bg-red-500/10 text-red-500 border-red-500/30" 
                            : "text-emerald-400 hover:text-emerald-300 border-transparent hover:bg-white/5"
                        } cursor-pointer`}
                        title={r.is_hidden ? "Show Review" : "Hide Review"}
                      >
                        {r.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </td>

                    {/* Action Deletes */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeletingReviewId(r.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
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
                Showing Page {currentPage} of {totalPages} ({totalCount} total reviews)
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

      {/* Delete Confirmation Modal */}
      {deletingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-400" size={20} />
              Confirm Delete
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeletingReviewId(null)}
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
