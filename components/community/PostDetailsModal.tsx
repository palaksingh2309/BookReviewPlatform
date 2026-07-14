"use client";

import { useEffect, useState, useRef } from "react";
import { 
  X, 
  Loader2, 
  CornerDownRight, 
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Post, PostComment } from "../../types/community";
import { getPostCommentsAction, addCommentAction } from "../../actions/community";

interface PostDetailsModalProps {
  postId: string;
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentsUpdated: (postId: string, newCount: number) => void;
}

export default function PostDetailsModal({
  postId,
  post,
  isOpen,
  onClose,
  onCommentsUpdated
}: PostDetailsModalProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [rootReply, setRootReply] = useState("");
  const [submittingRoot, setSubmittingRoot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCommentCount(post.comments_count);
  }, [post.comments_count, postId]);

  // Fetch comments on mount or when postId changes
  useEffect(() => {
    if (!isOpen) return;

    async function loadComments() {
      try {
        setLoading(true);
        setError(null);
        const res = await getPostCommentsAction(postId);
        if (!res.success) {
          setError(res.error || "Failed to load comments.");
        } else {
          setComments(res.data || []);
        }
      } catch {
        setError("Failed to fetch comments.");
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [postId, isOpen]);

  if (!isOpen) return null;

  // Handle comment additions anywhere in the tree
  const insertNewComment = (
    list: PostComment[],
    newComment: PostComment
  ): PostComment[] => {
    if (!newComment.parent_id) {
      return [...list, { ...newComment, replies: [] }];
    }
    
    return list.map((c) => {
      if (c.id === newComment.parent_id) {
        return {
          ...c,
          replies: [...(c.replies || []), { ...newComment, replies: [] }]
        };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: insertNewComment(c.replies, newComment)
        };
      }
      return c;
    });
  };

  const handleAddComment = (newComment: PostComment) => {
    setComments((prev) => insertNewComment(prev, newComment));
    setCommentCount((prev) => {
      const next = prev + 1;
      onCommentsUpdated(postId, next);
      return next;
    });
  };

  const handlePostRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootReply.trim() || submittingRoot) return;
    setSubmittingRoot(true);
    setError(null);

    try {
      const res = await addCommentAction(postId, rootReply.trim(), null);
      if (res.success && res.data) {
        handleAddComment(res.data);
        setRootReply("");
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
      } else {
        setError(res.error || "Failed to post comment.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmittingRoot(false);
    }
  };

  const parentAuthorName = post.profiles?.full_name || post.profiles?.username || "Reader";
  const parentInitials = parentAuthorName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
            Thread
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable feed area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Original Post (Root of the thread) */}
          <div className="flex gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 font-semibold text-white text-sm ring-2 ring-neutral-800 shadow-md">
              {parentInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">{parentAuthorName}</p>
              {post.profiles?.username && (
                <p className="text-xs text-neutral-500 mt-0.5">@{post.profiles.username}</p>
              )}
              
              <div className="mt-3 space-y-2">
                {post.content && <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>}
                
                {post.quote && (
                  <blockquote className="rounded-xl border border-white/5 border-l-indigo-500 border-l-4 bg-indigo-500/5 px-4.5 py-3 italic text-neutral-300 text-xs font-serif leading-relaxed">
                    &ldquo;{post.quote}&rdquo;
                  </blockquote>
                )}
                
                {post.short_story && (
                  <div className="rounded-xl border border-white/5 bg-pink-500/[0.03] p-3 text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap">
                    <span className="font-bold text-pink-400 block mb-1">Short Story</span>
                    {post.short_story}
                  </div>
                )}

                {post.post_images && post.post_images.length > 0 && (
                  <div className="grid gap-1.5 overflow-hidden rounded-xl border border-white/5 bg-neutral-900/40 mt-3 grid-cols-2">
                    {post.post_images.map((img) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt="attachment"
                        className="aspect-video object-cover w-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 my-4" />

          {/* Comments/Replies list */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-500 space-y-3">
              <MessageSquare className="h-8 w-8 text-neutral-700" />
              <p className="text-sm">No replies yet. Be the first to answer!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  onReplyAdded={handleAddComment}
                  depth={0}
                />
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Compose Input Bar (Reply to thread root) */}
        <form onSubmit={handlePostRootComment} className="border-t border-white/5 bg-neutral-950 p-4 flex gap-3">
          <input
            type="text"
            value={rootReply}
            onChange={(e) => setRootReply(e.target.value)}
            placeholder={`Reply to ${parentAuthorName}...`}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4.5 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20"
          />
          <button
            type="submit"
            disabled={!rootReply.trim() || submittingRoot}
            className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submittingRoot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

/* Sub-component to recursively render comment nodes */
interface CommentNodeProps {
  comment: PostComment;
  postId: string;
  onReplyAdded: (newComment: PostComment) => void;
  depth: number;
}

function CommentNode({ comment, postId, onReplyAdded, depth }: CommentNodeProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorName = comment.profiles?.full_name || comment.profiles?.username || "Reader";
  const initials = authorName.substring(0, 2).toUpperCase();

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await addCommentAction(postId, replyContent.trim(), comment.id);
      if (res.success && res.data) {
        onReplyAdded(res.data);
        setReplyContent("");
        setShowReplyForm(false);
      } else {
        setError(res.error || "Failed to post reply.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Limit visual indent spacing on mobile screens
  const getIndentMargin = () => {
    if (depth === 0) return "";
    if (depth > 4) return "ml-4"; // cap indentation
    return "ml-6";
  };

  return (
    <div className={`space-y-3 ${getIndentMargin()}`}>
      <div className="flex gap-3">
        {/* Reply Connector Line for Depth 0 */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-pink-500/80 font-semibold text-white text-xs ring-1 ring-neutral-800">
            {initials}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="w-px grow bg-white/5 rounded-full mt-1.5" />
          )}
        </div>

        {/* Comment Body */}
        <div className="flex-1 min-w-0 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 hover:border-white/10 transition">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs leading-none hover:underline cursor-pointer">
              {authorName}
            </span>
            <span className="text-[10px] text-neutral-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-neutral-300 text-sm mt-2 leading-relaxed break-words whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-3 mt-2.5">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              <CornerDownRight size={10} />
              Reply
            </button>
          </div>

          {/* Quick Reply Form */}
          {showReplyForm && (
            <form onSubmit={handlePostReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${authorName}...`}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-indigo-400/50"
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || submitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send size={11} />
                )}
              </button>
            </form>
          )}

          {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
        </div>
      </div>

      {/* Recursive Render of Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 pt-1">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
