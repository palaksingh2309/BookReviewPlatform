"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { getPostsFeedAction } from "../../actions/community";
import { Post } from "../../types/community";
import PostCard from "../community/PostCard";
import PostDetailsModal from "../community/PostDetailsModal";

interface ProfilePostsListProps {
  userId: string;
}

export default function ProfilePostsList({ userId }: ProfilePostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const loadProfilePosts = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getPostsFeedAction({ userId, filter: "all", page: pageNum });
      if (res.success && res.data) {
        const data = res.data;
        const count = res.count ?? 0;
        setPosts((prev) => {
          const updated = append ? [...prev, ...data] : data;
          setHasMore(data.length > 0 && updated.length < count);
          return updated;
        });
      } else {
        setError(res.error || "Failed to load your posts.");
        if (!append) setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching profile posts:", err);
      setError("Failed to load your posts.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadProfilePosts(1, false);
  }, [userId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProfilePosts(nextPage, true);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCommentClicked = (postId: string) => {
    const matched = posts.find((p) => p.id === postId);
    if (matched) {
      setSelectedPost(matched);
      setSelectedPostId(postId);
      setIsThreadOpen(true);
    }
  };

  const handleCommentsCountUpdated = (pId: string, newCount: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, comments_count: newCount } : p))
    );
    if (selectedPost && selectedPost.id === pId) {
      setSelectedPost((prev) => (prev ? { ...prev, comments_count: newCount } : null));
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] py-12 text-center text-neutral-500 space-y-3">
        <MessageSquare size={28} className="text-neutral-700" />
        <div>
          <h3 className="text-sm font-bold text-white">No posts shared</h3>
          <p className="text-xs text-neutral-600 mt-0.5">Posts created in the community space will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={userId}
          onCommentClick={handleCommentClicked}
          onPostDeleted={handlePostDeleted}
        />
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          {loadingMore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load more posts"
          )}
        </button>
      )}

      {selectedPostId && selectedPost && (
        <PostDetailsModal
          postId={selectedPostId}
          post={selectedPost}
          isOpen={isThreadOpen}
          onClose={() => {
            setIsThreadOpen(false);
            setSelectedPostId(null);
            setSelectedPost(null);
          }}
          onCommentsUpdated={handleCommentsCountUpdated}
        />
      )}
    </div>
  );
}
