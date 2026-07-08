import { supabase } from "../lib/supabase";

export async function getWishlist() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist")
    .select("book_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching wishlist:", error.message);
    return [];
  }

  return data.map((item) => item.book_id);
}

export async function addToWishlist(bookId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: user.id,
      book_id: bookId,
    });

  return { data, error };
}

export async function removeFromWishlist(bookId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  return { data, error };
}
