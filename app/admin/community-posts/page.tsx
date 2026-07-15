"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Trash2, 
  Loader2, 
  FileText, 
  Pin, 
  Flame, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen
} from "lucide-react";

import { getPostsAction, moderatePostAction, deletePostAction } from "../../../actions/admin";
import { useToast } from "../../../components/Toast";

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  quote: string | null;
  short_story: string | null;
  book_reference_id: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  is_hidden: boolean;
  created_at: string;
  profiles?: {
    username: string;
  } | null;
  books?: {
    title: string;
  } | null;
}

export default function CommunityPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPinned, setFilterPinned] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [filterHidden, setFilterHidden] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Delete post modal state
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load posts on filter changes
  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const isPinned = filterPinned === "pinned" ? true : filterPinned === "not-pinned" ? false : undefined;
        const isFeatured = filterFeatured === "featured" ? true : filterFeatured === "not-featured" ? false : undefined;
        const isHidden = filterHidden === "hidden" ? true : filterHidden === "visible" ? false : undefined;

        const result = await getPostsAction({
          search,
          isPinned,
          isFeatured,
          isHidden,
          page: currentPage,
        });

        if (result.success && result.posts) {
          setPosts(result.posts as Post[]);
          setTotalPages(result.totalPages || 1);
          setTotalCount(result.totalCount || 0);
        } else {
          toast({
            title: "Failed to load posts",
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
      loadPosts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterPinned, filterFeatured, filterHidden, currentPage, toast]);

  // Handle page changes
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  // Moderate post toggles (pin, feature, hide)
  async function handleToggleField(post: Post, field: "is_pinned" | "is_featured" | "is_hidden", value: boolean) {
    try {
      const updates = { [field]: value };
      const res = await moderatePostAction(post.id, updates);

      if (res.success) {
        toast({
          title: "Success",
          description: `Post moderation status updated.`,
          type: "success",
        });

        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, [field]: value } : p))
        );
      } else {
        toast({
          title: "Action failed",
          description: res.error || "Permission error.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not execute action.",
        type: "error",
      });
    }
  }

  // Confirm delete post
  async function handleDeleteConfirm() {
    if (!deletingPostId) return;

    startTransition(async () => {
      try {
        const res = await deletePostAction(deletingPostId);
        if (res.success) {
          toast({
            title: "Post deleted",
            description: "The thread has been removed from the database.",
            type: "success",
          });
          setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
          setTotalCount((c) => c - 1);
        } else {
          toast({
            title: "Delete failed",
            description: res.error || "Constraint check failure.",
            type: "error",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Operation failed.",
          type: "error",
        });
      } finally {
        setDeletingPostId(null);
      }
    });
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Community Posts</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review threads on the social feed. Pin announcements, feature discussions, hide inappropriate posts, or delete content.
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
            placeholder="Search posts by content keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 placeholder:text-neutral-600"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filterPinned}
            onChange={(e) => {
              setFilterPinned(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 outline-none focus:border-indigo-400/50"
          >
            <option value="all" className="bg-neutral-900 text-white">All Pin states</option>
            <option value="pinned" className="bg-neutral-900 text-white">Pinned Only</option>
            <option value="not-pinned" className="bg-neutral-900 text-white">Not Pinned</option>
          </select>

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

      {/* Posts listing table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-neutral-500 font-medium">Fetching community feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-16 text-center text-neutral-500 font-sans">
          No community posts matched the criteria.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-neutral-300">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-neutral-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-6">User / References</th>
                  <th className="py-4.5 px-6 w-96">Content Summary</th>
                  <th className="py-4.5 px-6">Stats</th>
                  <th className="py-4.5 px-6">Pinned</th>
                  <th className="py-4.5 px-6">Featured</th>
                  <th className="py-4.5 px-6">Hidden</th>
                  <th className="py-4.5 px-6 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((p) => {
                  const postText = p.content || p.quote || p.short_story || "";
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* User and Book Ref */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-white">@{p.profiles?.username || "unknown"}</p>
                        {p.books?.title && (
                          <p className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1 mt-1 font-sans">
                            <BookOpen size={10} />
                            Ref: {p.books.title}
                          </p>
                        )}
                      </td>

                      {/* Content snippet */}
                      <td className="py-4 px-6 font-sans text-xs text-neutral-400 leading-relaxed max-w-sm truncate whitespace-normal">
                        {p.quote && <span className="text-pink-400 font-semibold">Quote: </span>}
                        {p.short_story && <span className="text-indigo-400 font-semibold">Story: </span>}
                        {postText}
                      </td>

                      {/* Engagement stats */}
                      <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                        {p.likes_count} likes • {p.comments_count} replies
                      </td>

                      {/* Pin Toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleField(p, "is_pinned", !p.is_pinned)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_pinned 
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                              : "text-neutral-500 hover:text-white border-transparent hover:bg-white/5"
                          } cursor-pointer`}
                          title={p.is_pinned ? "Unpin Post" : "Pin Post"}
                        >
                          <Pin size={14} className={p.is_pinned ? "rotate-45" : ""} />
                        </button>
                      </td>

                      {/* Feature Toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleField(p, "is_featured", !p.is_featured)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_featured 
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                              : "text-neutral-500 hover:text-white border-transparent hover:bg-white/5"
                          } cursor-pointer`}
                          title={p.is_featured ? "Remove Featured" : "Feature Post"}
                        >
                          <Flame size={14} fill={p.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>

                      {/* Hide Toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleField(p, "is_hidden", !p.is_hidden)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_hidden 
                              ? "bg-red-500/10 text-red-500 border-red-500/30" 
                              : "text-emerald-400 hover:text-emerald-350 border-transparent hover:bg-white/5"
                          } cursor-pointer`}
                          title={p.is_hidden ? "Show Post" : "Hide Post"}
                        >
                          {p.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </td>

                      {/* Hard Delete */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setDeletingPostId(p.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/10 rounded-lg inline-flex cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-white/2 px-6 py-4">
              <span className="text-xs text-neutral-500 font-sans">
                Showing Page {currentPage} of {totalPages} ({totalCount} total posts)
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
      {deletingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="text-red-400" size={20} />
              Confirm Delete
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Are you sure you want to permanently delete this community post? This will delete all comment threads and notifications related to it.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setDeletingPostId(null)}
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
