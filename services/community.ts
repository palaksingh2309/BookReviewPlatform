import { supabase as defaultSupabase } from "../lib/supabase";
import { Post, PostComment, Notification, Hashtag } from "../types/community";

const PAGE_SIZE = 10;

export async function getPostsFeed(
  options: {
    page?: number;
    search?: string;
    filter?: "all" | "liked" | "bookmarked";
    userId?: string;
  } = {},
  supabase = defaultSupabase
) {
  const { page = 1, search = "", filter = "all", userId } = options;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Build columns selector dynamically
  let columns = `
    *,
    profiles:profiles (username, full_name, avatar_url),
    post_images (id, image_url),
    books (id, title, author, image)
  `;

  const cleanedSearch = search.trim();
  const isHashtagSearch = cleanedSearch.startsWith("#");

  if (user) {
    if (filter === "liked") {
      columns += `, post_likes!inner(user_id)`;
    } else if (filter === "bookmarked") {
      columns += `, post_bookmarks!inner(user_id)`;
    }
  }

  if (cleanedSearch && isHashtagSearch) {
    columns += `, post_hashtags!inner (
      hashtag:hashtags!inner (name)
    )`;
  }

  // 2. Build base query with exact count
  let query = supabase
    .from("posts")
    .select(columns, { count: "exact" })
    .is("deleted_at", null);

  // 3. Filter by user id (for profile pages)
  if (userId) {
    query = query.eq("user_id", userId);
  }

  // 4. Handle specific tabs (Likes or Bookmarks)
  if (user) {
    if (filter === "liked") {
      query = query.eq("post_likes.user_id", user.id);
    } else if (filter === "bookmarked") {
      query = query.eq("post_bookmarks.user_id", user.id);
    }
  }

  // 5. Handle Smart Search
  if (cleanedSearch) {
    if (isHashtagSearch) {
      const hashtagName = cleanedSearch.slice(1).toLowerCase();
      query = query.eq("post_hashtags.hashtag.name", hashtagName);
    } else {
      // General search: text search matching content/quote/story or creator username
      // We first check if we find profiles with this username to search their posts
      const { data: matchedProfiles } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", `%${cleanedSearch}%`);

      const matchedUserIds = matchedProfiles?.map((p) => p.id) || [];

      if (matchedUserIds.length > 0) {
        query = query.or(
          `content.ilike.%${cleanedSearch}%,quote.ilike.%${cleanedSearch}%,short_story.ilike.%${cleanedSearch}%,user_id.in.(${matchedUserIds.join(",")})`
        );
      } else {
        query = query.or(
          `content.ilike.%${cleanedSearch}%,quote.ilike.%${cleanedSearch}%,short_story.ilike.%${cleanedSearch}%`
        );
      }
    }
  }

  // 5. Order and Paginate
  query = query
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) return { data: null, count: 0, error };

  let posts = (data as any || []) as Post[];

  // 6. Augment post states (has liked, has bookmarked, has reposted)
  if (user && posts.length > 0) {
    const postIds = posts.map((p) => p.id);

    // Likes check
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    const likedSet = new Set(likes?.map((l) => l.post_id) || []);

    // Bookmarks check
    const { data: bookmarks } = await supabase
      .from("post_bookmarks")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    const bookmarkedSet = new Set(bookmarks?.map((b) => b.post_id) || []);

    // Shares check
    const { data: shares } = await supabase
      .from("post_shares")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    const sharedSet = new Set(shares?.map((s) => s.post_id) || []);

    posts = posts.map((p) => ({
      ...p,
      user_has_liked: likedSet.has(p.id),
      user_has_bookmarked: bookmarkedSet.has(p.id),
      user_has_reposted: sharedSet.has(p.id),
    }));
  }

  return { data: posts, count: count || 0, error: null };
}

export async function getPostDetails(postId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:profiles (username, full_name, avatar_url),
      post_images (id, image_url),
      books (id, title, author, image)
    `)
    .eq("id", postId)
    .is("deleted_at", null)
    .maybeSingle();

  if (postError || !post) return { data: null, error: postError || new Error("Post not found") };

  const postObj = post as Post;

  // Augment client states
  if (user) {
    const { data: like } = await supabase
      .from("post_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    const { data: bookmark } = await supabase
      .from("post_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    const { data: share } = await supabase
      .from("post_shares")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    postObj.user_has_liked = !!like;
    postObj.user_has_bookmarked = !!bookmark;
    postObj.user_has_reposted = !!share;
  }

  // Increment view analytics count (non-blocking)
  supabase.rpc("increment_post_views", { p_id: postId }).then(({ error }) => {
    if (error) {
      // Fallback update if RPC is missing
      supabase
        .from("post_analytics")
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq("post_id", postId);
    }
  });

  return { data: postObj, error: null };
}

export async function getPostComments(postId: string, supabase = defaultSupabase) {
  const { data, error } = await supabase
    .from("post_comments")
    .select(`
      *,
      profiles:profiles (username, full_name, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error };

  const comments = (data || []) as PostComment[];
  const commentMap: { [key: string]: PostComment & { replies: PostComment[] } } = {};
  const rootComments: PostComment[] = [];

  comments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    const mapped = commentMap[c.id];
    if (c.parent_id) {
      const parent = commentMap[c.parent_id];
      if (parent) {
        parent.replies.push(mapped);
      } else {
        rootComments.push(mapped); // Orphaned to root
      }
    } else {
      rootComments.push(mapped);
    }
  });

  return { data: rootComments, error: null };
}

export async function createPost(
  entry: {
    content?: string | null;
    quote?: string | null;
    short_story?: string | null;
    book_reference_id?: string | null;
    image_urls?: string[];
  },
  supabase = defaultSupabase
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  // 1. Insert post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      content: entry.content || null,
      quote: entry.quote || null,
      short_story: entry.short_story || null,
      book_reference_id: entry.book_reference_id || null,
    })
    .select()
    .single();

  if (postError || !post) return { data: null, error: postError || new Error("Failed to create post") };

  // 2. Insert post images
  if (entry.image_urls && entry.image_urls.length > 0) {
    const imageRows = entry.image_urls.map((url) => ({
      post_id: post.id,
      image_url: url,
    }));
    const { error: imgError } = await supabase.from("post_images").insert(imageRows);
    if (imgError) console.error("Error inserting post images:", imgError);
  }

  // 3. Extract and insert hashtags
  const combinedText = `${entry.content || ""} ${entry.quote || ""} ${entry.short_story || ""}`;
  const hashtags = extractHashtags(combinedText);
  if (hashtags.length > 0) {
    for (const name of hashtags) {
      const { data: tag, error: tagError } = await supabase
        .from("hashtags")
        .upsert({ name }, { onConflict: "name" })
        .select()
        .single();

      if (tag) {
        await supabase
          .from("post_hashtags")
          .insert({ post_id: post.id, hashtag_id: tag.id });
      }
    }
  }

  // 4. Extract and insert mentions (notifies mentioned users via DB trigger)
  await extractAndInsertMentions(post.id, combinedText, supabase);

  return { data: post as Post, error: null };
}

export async function addComment(
  postId: string,
  content: string,
  parentId: string | null = null,
  supabase = defaultSupabase
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content,
    })
    .select(`
      *,
      profiles:profiles (username, full_name, avatar_url)
    `)
    .single();

  return { data: data as PostComment | null, error };
}

export async function toggleLikePost(postId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { liked: false, error: new Error("User not authenticated") };

  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);
    return { liked: false, error };
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ user_id: user.id, post_id: postId });
    return { liked: true, error };
  }
}

export async function toggleBookmarkPost(postId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { bookmarked: false, error: new Error("User not authenticated") };

  const { data: existingBookmark } = await supabase
    .from("post_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existingBookmark) {
    const { error } = await supabase
      .from("post_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);
    return { bookmarked: false, error };
  } else {
    const { error } = await supabase
      .from("post_bookmarks")
      .insert({ user_id: user.id, post_id: postId });
    return { bookmarked: true, error };
  }
}

export async function sharePost(postId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { shared: false, error: new Error("User not authenticated") };

  const { data: existingShare } = await supabase
    .from("post_shares")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existingShare) {
    return { shared: true, error: null }; // Already shared
  }

  const { error } = await supabase
    .from("post_shares")
    .insert({ user_id: user.id, post_id: postId });

  return { shared: !error, error };
}

export async function deletePost(postId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("User not authenticated") };

  // Soft delete post by setting deleted_at to current timestamp
  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("user_id", user.id);

  return { error };
}

export async function getNotifications(supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      sender_profile:profiles!notifications_sender_id_fkey (username, full_name, avatar_url),
      posts (content, quote, short_story)
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data as Notification[] | null, error };
}

export async function markNotificationsAsRead(supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("User not authenticated") };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return { error };
}

export async function getTrendingHashtags(supabase = defaultSupabase) {
  // Aggregate tags by matching entries in post_hashtags (we pull top 6 tags)
  const { data, error } = await supabase
    .from("post_hashtags")
    .select(`
      hashtag_id,
      hashtag:hashtags!inner (id, name)
    `);

  if (error) return { data: null, error };

  const counts: { [key: string]: { name: string; id: string; count: number } } = {};
  data.forEach((row: any) => {
    if (row.hashtag) {
      const tag = row.hashtag;
      if (!counts[tag.name]) {
        counts[tag.name] = { id: tag.id, name: tag.name, count: 0 };
      }
      counts[tag.name].count++;
    }
  });

  const sortedTags = Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) as Hashtag[];

  return { data: sortedTags, error: null };
}

// Helpers
function extractHashtags(text: string): string[] {
  const regex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(regex);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}

async function extractAndInsertMentions(postId: string, text: string, supabase = defaultSupabase) {
  const regex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(regex);
  if (!matches) return;
  const usernames = Array.from(new Set(matches.map((m) => m.slice(1))));

  if (usernames.length === 0) return;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .in("username", usernames);

  if (profiles && profiles.length > 0) {
    const mentions = profiles.map((p) => ({
      post_id: postId,
      mentioned_user_id: p.id,
    }));
    await supabase.from("post_mentions").insert(mentions);
  }
}
