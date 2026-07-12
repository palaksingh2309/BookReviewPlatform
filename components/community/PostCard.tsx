"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Bookmark, 
  Trash2, 
  ExternalLink,
  BookOpen,
  Quote as QuoteIcon,
  Maximize2,
  X,
  Share2,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Post } from "../../types/community";
import { 
  toggleLikePostAction, 
  toggleBookmarkPostAction, 
  sharePostAction,
  deletePostAction 
} from "../../actions/community";

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  onCommentClick: (postId: string) => void;
  onPostDeleted?: () => void;
}

export default function PostCard({ post, currentUserId, onCommentClick, onPostDeleted }: PostCardProps) {
  // Optimistic UI states
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [hasLiked, setHasLiked] = useState(post.user_has_liked || false);
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarks_count);
  const [hasBookmarked, setHasBookmarked] = useState(post.user_has_bookmarked || false);
  const [sharesCount, setSharesCount] = useState(post.shares_count);
  const [hasReposted, setHasReposted] = useState(post.user_has_reposted || false);
  
  // UI utility states
  const [submittingLike, setSubmittingLike] = useState(false);
  const [submittingBookmark, setSubmittingBookmark] = useState(false);
  const [submittingShare, setSubmittingShare] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Lightbox modal state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const isOwner = currentUserId === post.user_id;
  const authorName = post.profiles?.full_name || post.profiles?.username || "Reader";
  const authorUsername = post.profiles?.username ? `@${post.profiles.username}` : "";
  const initials = authorName.substring(0, 2).toUpperCase();

  // Parse hashtags (#word) and mentions (@word) into links
  const renderParsedText = (text: string | null) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith("#") && part.length > 1) {
        const cleanTag = part.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        return (
          <Link
            key={i}
            href={`/feed?search=%23${encodeURIComponent(cleanTag)}`}
            className="text-indigo-400 font-semibold transition hover:text-indigo-300 hover:underline"
          >
            {part}
          </Link>
        );
      }
      if (part.startsWith("@") && part.length > 1) {
        const cleanUser = part.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        // Search user feed
        return (
          <Link
            key={i}
            href={`/feed?search=${encodeURIComponent(cleanUser)}`}
            className="text-pink-400 font-semibold transition hover:text-pink-300 hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // Human readable time diff
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  // Optimistic Like Handler
  const handleLike = async () => {
    if (submittingLike) return;
    setSubmittingLike(true);

    const prevLiked = hasLiked;
    const prevCount = likesCount;

    // Toggle immediately
    setHasLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? Math.max(prev - 1, 0) : prev + 1));

    try {
      const res = await toggleLikePostAction(post.id);
      if (!res.success) {
        // Revert on error
        setHasLiked(prevLiked);
        setLikesCount(prevCount);
        showToast(res.error || "Failed to update like status.", "error");
      }
    } catch {
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
      showToast("Something went wrong.", "error");
    } finally {
      setSubmittingLike(false);
    }
  };

  // Optimistic Bookmark Handler
  const handleBookmark = async () => {
    if (submittingBookmark) return;
    setSubmittingBookmark(true);

    const prevBookmarked = hasBookmarked;
    const prevCount = bookmarksCount;

    setHasBookmarked(!prevBookmarked);
    setBookmarksCount((prev) => (prevBookmarked ? Math.max(prev - 1, 0) : prev + 1));

    try {
      const res = await toggleBookmarkPostAction(post.id);
      if (!res.success) {
        setHasBookmarked(prevBookmarked);
        setBookmarksCount(prevCount);
        showToast(res.error || "Failed to bookmark post.", "error");
      } else {
        showToast(
          res.bookmarked ? "Saved to bookmarks!" : "Removed from bookmarks.",
          "success"
        );
      }
    } catch {
      setHasBookmarked(prevBookmarked);
      setBookmarksCount(prevCount);
      showToast("Something went wrong.", "error");
    } finally {
      setSubmittingBookmark(false);
    }
  };

  // Share Handler
  const handleShare = async () => {
    if (submittingShare) return;
    setSubmittingShare(true);

    const prevCount = sharesCount;
    const prevReposted = hasReposted;

    setSharesCount((prev) => (prevReposted ? prev : prev + 1));
    setHasReposted(true);

    try {
      const res = await sharePostAction(post.id);
      if (res.success) {
        showToast("Post shared successfully!", "success");
      } else {
        setSharesCount(prevCount);
        setHasReposted(prevReposted);
        showToast(res.error || "Failed to share post.", "error");
      }
    } catch {
      setSharesCount(prevCount);
      setHasReposted(prevReposted);
      showToast("Something went wrong.", "error");
    } finally {
      setSubmittingShare(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(true);

    try {
      const res = await deletePostAction(post.id);
      if (res.success) {
        showToast("Post deleted successfully.", "success");
        if (onPostDeleted) onPostDeleted();
      } else {
        showToast(res.error || "Failed to delete post.", "error");
      }
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Dynamic Image Grid helper (Twitter style)
  const renderImageGrid = (imgList: any[]) => {
    if (!imgList || imgList.length === 0) return null;
    const count = imgList.length;

    const getGridCols = () => {
      if (count === 1) return "grid-cols-1";
      return "grid-cols-2";
    };

    return (
      <div className={`grid gap-1.5 overflow-hidden rounded-xl border border-white/5 bg-neutral-900/40 mt-3 ${getGridCols()}`}>
        {imgList.map((img, idx) => {
          // Special aspect sizes for 3 images layout
          const isLargeFirst = count === 3 && idx === 0;
          return (
            <div
              key={img.id}
              onClick={() => setLightboxImg(img.image_url)}
              className={`relative overflow-hidden cursor-zoom-in group ${
                isLargeFirst ? "row-span-2 aspect-square md:aspect-auto" : "aspect-video"
              }`}
            >
              <img
                src={img.image_url}
                alt="Post attachment"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white drop-shadow" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-semibold text-white">{toast.message}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            title="Close image"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxImg}
            alt="Enlarged view"
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Main Card */}
      <article className="group relative flex gap-4 rounded-2xl border border-white/10 bg-neutral-950/40 p-5 backdrop-blur-md transition duration-300 hover:border-white/20 hover:bg-neutral-900/20">
        {/* User initials Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 font-semibold text-white text-sm ring-2 ring-neutral-800 shadow-md">
            {initials}
          </div>
          <div className="w-0.5 grow bg-white/5 rounded-full mt-2 group-hover:bg-white/10 transition" />
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row (Name, username, timestamp) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-white hover:underline cursor-pointer truncate max-w-[120px] sm:max-w-none">
                {authorName}
              </span>
              {authorUsername && (
                <span className="text-neutral-500 truncate hidden sm:inline">{authorUsername}</span>
              )}
              <span className="text-neutral-600">&bull;</span>
              <span className="text-neutral-500 text-xs shrink-0" title={new Date(post.created_at).toLocaleString()}>
                {formatTime(post.created_at)}
              </span>
            </div>

            {/* Action Menu (Delete post if owner) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full p-1.5 text-neutral-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition"
                title="Delete post"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            )}
          </div>

          {/* Primary Text Content */}
          {post.content && (
            <p className="text-neutral-200 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {renderParsedText(post.content)}
            </p>
          )}

          {/* Optional Quote Block */}
          {post.quote && (
            <blockquote className="relative rounded-xl border border-white/5 border-l-indigo-500 border-l-4 bg-indigo-500/5 px-4.5 py-3.5 italic text-neutral-300 text-[14.5px] leading-relaxed font-serif">
              <QuoteIcon className="absolute -left-1 -top-1 h-8 w-8 text-indigo-500/10 rotate-180 -z-10" />
              &ldquo;{post.quote}&rdquo;
            </blockquote>
          )}

          {/* Optional Short Story Block */}
          {post.short_story && (
            <div className="rounded-xl border border-white/5 bg-pink-500/[0.03] p-4 space-y-2 border-t-pink-500 border-t-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-400">
                Short Story
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {post.short_story}
              </p>
            </div>
          )}

          {/* Attached Images Grid */}
          {post.post_images && post.post_images.length > 0 && renderImageGrid(post.post_images)}

          {/* Referenced Book Card */}
          {post.books && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-900/40 p-3 mt-3 transition hover:bg-neutral-900/60">
              <div className="flex items-center gap-3">
                {post.books.image && (
                  <img
                    src={post.books.image}
                    alt={post.books.title}
                    className="h-12 w-9 rounded bg-neutral-800 object-cover shadow shadow-black/20"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={12} className="text-indigo-400" />
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Referenced Book</p>
                  </div>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">{post.books.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{post.books.author}</p>
                </div>
              </div>
              <Link
                href={`/books?book=${post.books.id}`}
                className="rounded-lg bg-white/5 p-2 text-neutral-400 hover:text-white transition"
                title="View book details"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          )}

          {/* Footer Action Icons Bar */}
          <div className="flex items-center justify-between text-neutral-500 border-t border-white/5 pt-3 mt-4 text-[13px]">
            {/* Comment Trigger */}
            <button
              onClick={() => onCommentClick(post.id)}
              className="flex items-center gap-2 group/btn hover:text-indigo-400 transition"
              title="Add a reply"
            >
              <span className="flex items-center justify-center h-8 w-8 rounded-full group-hover/btn:bg-indigo-500/10 transition">
                <MessageCircle size={16} />
              </span>
              <span className="font-medium">{post.comments_count}</span>
            </button>

            {/* Like Trigger */}
            <button
              onClick={handleLike}
              disabled={submittingLike}
              className={`flex items-center gap-2 group/btn hover:text-red-400 transition ${
                hasLiked ? "text-red-400" : ""
              }`}
              title={hasLiked ? "Unlike post" : "Like post"}
            >
              <span className={`flex items-center justify-center h-8 w-8 rounded-full group-hover/btn:bg-red-500/10 transition`}>
                <Heart size={16} className={hasLiked ? "fill-red-500 text-red-500 animate-ping-once" : ""} />
              </span>
              <span className="font-medium">{likesCount}</span>
            </button>

            {/* Repost Trigger */}
            <button
              onClick={handleShare}
              disabled={submittingShare}
              className={`flex items-center gap-2 group/btn hover:text-emerald-400 transition ${
                hasReposted ? "text-emerald-400" : ""
              }`}
              title="Share / Repost"
            >
              <span className="flex items-center justify-center h-8 w-8 rounded-full group-hover/btn:bg-emerald-500/10 transition">
                <Repeat size={16} />
              </span>
              <span className="font-medium">{sharesCount}</span>
            </button>

            {/* Bookmark Trigger */}
            <button
              onClick={handleBookmark}
              disabled={submittingBookmark}
              className={`flex items-center gap-2 group/btn hover:text-indigo-400 transition ${
                hasBookmarked ? "text-indigo-400" : ""
              }`}
              title={hasBookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <span className="flex items-center justify-center h-8 w-8 rounded-full group-hover/btn:bg-indigo-500/10 transition">
                <Bookmark size={16} className={hasBookmarked ? "fill-indigo-500 text-indigo-500" : ""} />
              </span>
              <span className="font-medium">{bookmarksCount}</span>
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
