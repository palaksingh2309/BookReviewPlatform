"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { getPostsFeed } from "../../services/community";
import { Post } from "../../types/community";
import PostCard from "../community/PostCard";
import PostDetailsModal from "../community/PostDetailsModal";

interface ProfilePostsListProps {
  userId: string;
}

export default function ProfilePostsList({ userId }: ProfilePostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const loadProfilePosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await getPostsFeed({ userId, filter: "all" });
      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching profile posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfilePosts();
  }, [userId]);

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
          onPostDeleted={loadProfilePosts}
        />
      ))}

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
