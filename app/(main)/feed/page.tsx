"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  BookOpen, 
  Settings, 
  User, 
  Search, 
  Bell, 
  Hash, 
  Sparkles, 
  TrendingUp, 
  Loader2, 
  ChevronLeft,
  X,
  MessageSquare,
  Bookmark,
  Heart,
  Grid
} from "lucide-react";

import SignOutButton from "../../../components/auth/SignOutButton";
import CreatePostBox from "../../../components/community/CreatePostBox";
import PostCard from "../../../components/community/PostCard";
import PostDetailsModal from "../../../components/community/PostDetailsModal";
import NotificationsModal from "../../../components/community/NotificationsModal";

import { getPostsFeed, getTrendingHashtags } from "../../../services/community";
import { getBooks } from "../../../services/books";
import { Post, Hashtag } from "../../../types/community";
import { Book } from "../../../types/book";
import { supabase } from "../../../lib/supabase";

function FeedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";

  // Auth User
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("Reader");
  const [userInitials, setUserInitials] = useState("RE");

  // Core Feed States
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingTags, setTrendingTags] = useState<Hashtag[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  
  // Filtering & Pagination
  const [activeTab, setActiveTab] = useState<"all" | "liked" | "bookmarked">("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modals & Panels
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 1. Get current auth user details
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setUserEmail(user.email || "Reader");
        setUserInitials(
          (user.email || "RE").substring(0, 2).toUpperCase()
        );
      }
    }
    loadUser();
  }, []);

  // 2. Sync URL search parameters
  useEffect(() => {
    const urlQuery = searchParams.get("search") || "";
    setSearchQuery(urlQuery);
    setAppliedSearch(urlQuery);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [searchParams]);

  // 3. Load posts feed based on tab, page, and search
  useEffect(() => {
    async function loadFeed() {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const { data, count, error } = await getPostsFeed({
          page,
          search: appliedSearch,
          filter: activeTab,
        });

        if (!error && data) {
          setPosts((prev) => (page === 1 ? data : [...prev, ...data]));
          // Determine if we reached the end of lists
          setHasMore(data.length > 0 && posts.length + data.length < count);
        }
      } catch (err) {
        console.error("Error loading feed:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    loadFeed();
  }, [page, appliedSearch, activeTab]);

  // 4. Load sidebar content (hashtags & trending books) on mount/tab shifts
  useEffect(() => {
    async function loadSidebar() {
      const { data: tags } = await getTrendingHashtags();
      setTrendingTags(tags || []);

      const { data: books } = await getBooks();
      // filter trending or top-rated ones for recommendations
      const filtered = (books || [])
        .filter((b) => b.is_trending || b.is_top_rated)
        .slice(0, 4);
      setRecommendedBooks(filtered);
    }
    loadSidebar();
  }, [posts]);

  // 5. Infinite Scroll Observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loading, loadingMore, hasMore]);

  // Feed Actions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push("/feed");
  };

  const handlePostCreated = () => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    // Reload first page
    router.refresh();
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-5%] h-[32rem] w-[32rem] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[32rem] w-[32rem] rounded-full bg-pink-600/10 blur-[130px]" />
      </div>

      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
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
            {/* Activity Bell Button */}
            <button
              onClick={() => setIsActivityOpen(true)}
              className="relative rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Activity Feed"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-neutral-950" />
              )}
            </button>
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

      {/* Main Page Layout */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          
          {/* Main Feed Column */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                  Community Space
                </p>
                <h1 className="font-display mt-1 text-2xl font-black sm:text-3xl">Community Feed</h1>
              </div>

              {/* Search Bar Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search tags, users, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-9 text-sm text-white outline-none focus:border-indigo-400/50"
                />
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-500 hover:bg-white/5 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </form>
            </div>

            {/* Active search filter indicator */}
            {appliedSearch && (
              <div className="flex items-center justify-between rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-sm text-indigo-200">
                <span>Showing search results for &ldquo;<span className="font-bold">{appliedSearch}</span>&rdquo;</span>
                <button
                  onClick={clearSearch}
                  className="rounded-full p-1 hover:bg-indigo-500/20 text-indigo-300"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Compose Card Box */}
            <CreatePostBox onPostCreated={handlePostCreated} userInitials={userInitials} />

            {/* Filters Navigation Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: "all", label: "All Posts", icon: Grid },
                { id: "liked", label: "Liked", icon: Heart },
                { id: "bookmarked", label: "Bookmarks", icon: Bookmark },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setPage(1);
                      setPosts([]);
                      setHasMore(true);
                    }}
                    className={`flex items-center gap-2 px-5 py-4 border-b-2 font-semibold text-sm transition ${
                      active
                        ? "border-indigo-500 text-white"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-indigo-400" : ""} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Post feed rendering */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] py-20 text-center text-neutral-500 space-y-4">
                <MessageSquare size={36} className="text-neutral-700" />
                <div>
                  <h3 className="text-base font-bold text-white">Quiet in this tab</h3>
                  <p className="text-sm text-neutral-600 mt-1 max-w-[280px]">No posts match your filters or search keywords. Try creating one!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4.5">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onCommentClick={handleCommentClicked}
                    onPostDeleted={handlePostCreated}
                  />
                ))}

                {/* Loading more card skeleton */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  </div>
                )}

                {/* Bottom reference node for Intersection observer */}
                <div ref={loadMoreRef} className="h-2" />
              </div>
            )}
          </div>

          {/* Right Column Sidebar Panels (Desktop only) */}
          <div className="hidden lg:block space-y-6">
            
            {/* Trending Hashtags */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4.5 space-y-4.5">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <Hash className="h-4 w-4 text-indigo-400" />
                Trending Topics
              </div>

              {trendingTags.length === 0 ? (
                <p className="text-xs text-neutral-600">No active hashtags</p>
              ) : (
                <div className="space-y-3">
                  {trendingTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/feed?search=%23${encodeURIComponent(tag.name)}`}
                      className="block text-neutral-300 hover:text-white transition group"
                    >
                      <p className="text-sm font-bold group-hover:underline">#{tag.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{tag.count} posts</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Book Cards recommendations */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4.5 space-y-4">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <TrendingUp className="h-4 w-4 text-pink-400" />
                Trending Books
              </div>
              
              <div className="space-y-3">
                {recommendedBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books?book=${book.id}`}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2 border border-white/5 hover:border-white/10 transition group"
                  >
                    {book.image && (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-10 w-7 rounded bg-neutral-800 object-cover group-hover:scale-105 transition"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-tight group-hover:underline">{book.title}</p>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{book.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        onNotificationClick={handleCommentClicked}
        onUnreadCountChange={setUnreadNotifications}
      />

      {/* Thread details Modal */}
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

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-neutral-950">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
