import { supabase as defaultSupabase } from "../lib/supabase";
import { Book } from "../types/book";

export async function getBooks(supabase = defaultSupabase) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("title", { ascending: true });
  return { data: data as Book[] | null, error };
}

export async function getBookById(id: string, supabase = defaultSupabase) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { data: data as Book | null, error };
}

export async function upsertBook(book: Book, supabase = defaultSupabase) {
  const { data, error } = await supabase
    .from("books")
    .upsert({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      rating: book.rating,
      reviews_count: book.reviews_count,
      published_year: book.published_year,
      image: book.image,
      description: book.description,
      is_trending: book.is_trending,
      is_top_rated: book.is_top_rated
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  return { data: data as Book | null, error };
}

