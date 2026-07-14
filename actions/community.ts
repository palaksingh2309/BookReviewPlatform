"use server";

import { createClient } from "../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { postSchema, commentSchema } from "../lib/validators";
import {
  createPost,
  toggleLikePost,
  toggleBookmarkPost,
  sharePost,
  addComment,
  deletePost,
  markNotificationsAsRead,
  getPostsFeed,
  getPostDetails,
  getPostComments,
  getNotifications,
  getUnreadNotificationsCount,
  getTrendingHashtags,
} from "../services/community";

export async function createPostAction(formData: {
  content?: string | null;
  quote?: string | null;
  short_story?: string | null;
  book_reference_id?: string | null;
  image_urls?: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  // 1. Zod input validation
  const result = postSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  // 2. Spam Prevention / Rate Limiting (5 posts per 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gt("created_at", fiveMinutesAgo);

  if (countError) return { success: false, error: countError.message };
  if (count !== null && count >= 5) {
    return { success: false, error: "Spam warning: You can only post 5 times every 5 minutes. Please wait before trying again." };
  }

  // 3. Create post
  const { data, error } = await createPost(formData, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  revalidatePath("/profile");
  return { success: true, data };
}

export async function toggleLikePostAction(postId: string) {
  const supabase = await createClient();
  const { liked, error } = await toggleLikePost(postId, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true, liked };
}

export async function toggleBookmarkPostAction(postId: string) {
  const supabase = await createClient();
  const { bookmarked, error } = await toggleBookmarkPost(postId, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true, bookmarked };
}

export async function sharePostAction(postId: string) {
  const supabase = await createClient();
  const { shared, error } = await sharePost(postId, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true, shared };
}

export async function addCommentAction(
  postId: string,
  content: string,
  parentId: string | null = null
) {
  const supabase = await createClient();
  const result = commentSchema.safeParse({ content, parent_id: parentId });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { data, error } = await addComment(postId, content, parentId, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true, data };
}

export async function deletePostAction(postId: string) {
  const supabase = await createClient();
  const { error } = await deletePost(postId, supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  revalidatePath("/profile");
  return { success: true };
}

export async function markNotificationsAsReadAction() {
  const supabase = await createClient();
  const { error } = await markNotificationsAsRead(supabase);
  if (error) return { success: false, error: error.message };

  revalidatePath("/feed");
  return { success: true };
}

export async function getPostsFeedAction(options: {
  page?: number;
  search?: string;
  filter?: "all" | "liked" | "bookmarked";
  userId?: string;
}) {
  const supabase = await createClient();
  const { data, count, error } = await getPostsFeed(options, supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, data, count };
}

export async function getPostDetailsAction(postId: string) {
  const supabase = await createClient();
  const { data, error } = await getPostDetails(postId, supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getPostCommentsAction(postId: string) {
  const supabase = await createClient();
  const { data, error } = await getPostComments(postId, supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getNotificationsAction() {
  const supabase = await createClient();
  const { data, error } = await getNotifications(supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getUnreadNotificationsCountAction() {
  const supabase = await createClient();
  const { count, error } = await getUnreadNotificationsCount(supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, count };
}

export async function getTrendingHashtagsAction() {
  const supabase = await createClient();
  const { data, error } = await getTrendingHashtags(supabase);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
