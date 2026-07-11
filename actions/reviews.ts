"use server";

import { createClient } from "../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { upsertReview, deleteReview, toggleLikeReview } from "../services/reviews";
import { reviewSchema } from "../lib/validators";

export async function upsertReviewAction(formData: {
  book_id: string;
  rating: number;
  content: string;
  is_spoiler: boolean;
}) {
  const supabase = await createClient();

  const result = reviewSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { data, error } = await upsertReview(formData, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/reviews`);
  revalidatePath(`/books`);
  revalidatePath(`/dashboard`);
  return { success: true, data };
}

export async function deleteReviewAction(bookId: string) {
  const supabase = await createClient();
  const { error } = await deleteReview(bookId, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/reviews`);
  revalidatePath(`/books`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function toggleLikeReviewAction(reviewId: string) {
  const supabase = await createClient();
  const { liked, error } = await toggleLikeReview(reviewId, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/reviews`);
  return { success: true, liked };
}
