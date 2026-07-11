import { supabase as defaultSupabase } from "../lib/supabase";
import { Review, ReviewAnalytics } from "../types/review";

export async function getReviewsForBook(bookId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch reviews with profiles
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:profiles (username, full_name)
    `)
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  let reviews = data as Review[];

  // If user is logged in, find which reviews they have liked
  if (user && reviews.length > 0) {
    const reviewIds = reviews.map((r) => r.id);
    const { data: likedData } = await supabase
      .from("review_likes")
      .select("review_id")
      .eq("user_id", user.id)
      .in("review_id", reviewIds);

    if (likedData) {
      const likedSet = new Set(likedData.map((l) => l.review_id));
      reviews = reviews.map((r) => ({
        ...r,
        user_has_liked: likedSet.has(r.id),
      }));
    }
  }

  return { data: reviews, error: null };
}

export async function getUserReviewForBook(bookId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: null };

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();

  return { data: data as Review | null, error };
}

export async function upsertReview(
  entry: {
    book_id: string;
    rating: number;
    content: string;
    is_spoiler: boolean;
  },
  supabase = defaultSupabase
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("reviews")
    .upsert({
      user_id: user.id,
      book_id: entry.book_id,
      rating: entry.rating,
      content: entry.content,
      is_spoiler: entry.is_spoiler,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book_id'
    })
    .select()
    .single();

  return { data: data as Review | null, error };
}

export async function deleteReview(bookId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("User not authenticated") };

  return await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);
}

export async function toggleLikeReview(reviewId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  // Check if like exists
  const { data: existingLike, error: checkError } = await supabase
    .from("review_likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("review_id", reviewId)
    .maybeSingle();

  if (checkError) return { data: null, error: checkError };

  if (existingLike) {
    // Delete like
    const { error: deleteError } = await supabase
      .from("review_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("review_id", reviewId);

    return { liked: false, error: deleteError };
  } else {
    // Add like
    const { error: insertError } = await supabase
      .from("review_likes")
      .insert({
        user_id: user.id,
        review_id: reviewId,
      });

    return { liked: true, error: insertError };
  }
}

export async function getReviewAnalytics(bookId: string, supabase = defaultSupabase): Promise<{ data: ReviewAnalytics | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("book_id", bookId);

  if (error) return { data: null, error: new Error(error.message) };

  const ratings = data || [];
  const totalReviews = ratings.length;
  
  let sum = 0;
  const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratings.forEach((r) => {
    sum += r.rating;
    counts[r.rating] = (counts[r.rating] || 0) + 1;
  });

  const averageRating = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(1)) : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars] || 0;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return {
      rating: stars,
      count,
      percentage,
    };
  });

  return {
    data: {
      averageRating,
      totalReviews,
      distribution,
    },
    error: null,
  };
}
