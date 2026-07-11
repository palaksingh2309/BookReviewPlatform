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
