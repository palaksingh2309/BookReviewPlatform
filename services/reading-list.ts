import { supabase as defaultSupabase } from "../lib/supabase";
import { ReadingListEntry, ReadingStats } from "../types/book";

export async function getReadingList(supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("reading_list")
    .select(`
      *,
      books:books (*)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return { data: data as ReadingListEntry[] | null, error };
}

export async function getReadingListEntry(bookId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("reading_list")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();

  return { data: data as ReadingListEntry | null, error };
}

export async function upsertReadingListEntry(
  entry: {
    book_id: string;
    status: 'want-to-read' | 'currently-reading' | 'completed' | 'dropped';
    progress_pages: number;
    total_pages: number;
    is_favorite: boolean;
    notes?: string | null;
  },
  supabase = defaultSupabase
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("reading_list")
    .upsert({
      user_id: user.id,
      book_id: entry.book_id,
      status: entry.status,
      progress_pages: entry.status === 'completed' ? entry.total_pages : entry.progress_pages,
      total_pages: entry.total_pages,
      is_favorite: entry.is_favorite,
      notes: entry.notes,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book_id'
    })
    .select()
    .single();

  return { data: data as ReadingListEntry | null, error };
}

export async function deleteReadingListEntry(bookId: string, supabase = defaultSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("User not authenticated") };

  return await supabase
    .from("reading_list")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);
}

export async function getReadingStats(supabase = defaultSupabase): Promise<{ data: ReadingStats | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("User not authenticated") };

  const { data, error } = await supabase
    .from("reading_list")
    .select(`
      *,
      books:books (category)
    `)
    .eq("user_id", user.id);

  if (error) return { data: null, error: new Error(error.message) };

  const entries = (data || []) as (ReadingListEntry & { books: { category: string } | null })[];

  let booksCompleted = 0;
  let booksCurrentlyReading = 0;
  let booksWantToRead = 0;
  let booksDropped = 0;
  let totalPagesRead = 0;

  const categories: { [key: string]: number } = {};

  entries.forEach((entry) => {
    totalPagesRead += entry.progress_pages;
    if (entry.status === 'completed') booksCompleted++;
    else if (entry.status === 'currently-reading') booksCurrentlyReading++;
    else if (entry.status === 'want-to-read') booksWantToRead++;
    else if (entry.status === 'dropped') booksDropped++;

    if (entry.books?.category) {
      categories[entry.books.category] = (categories[entry.books.category] || 0) + 1;
    }
  });

  // Calculate a streak based on unique update days
  const uniqueDays = new Set(
    entries.map((e) => new Date(e.updated_at).toDateString())
  );
  
  // Calculate continuous days leading up to today/yesterday
  let streakDays = 0;
  if (uniqueDays.size > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentCheck = new Date(today);
    let hasToday = uniqueDays.has(currentCheck.toDateString());
    
    if (!hasToday) {
      // Check if they updated yesterday
      currentCheck.setDate(currentCheck.getDate() - 1);
      if (uniqueDays.has(currentCheck.toDateString())) {
        hasToday = true;
      }
    }

    if (hasToday) {
      while (uniqueDays.has(currentCheck.toDateString())) {
        streakDays++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      }
    }
  }

  const categoryDistribution = Object.keys(categories).map((cat) => ({
    category: cat,
    count: categories[cat],
  }));

  const stats: ReadingStats = {
    booksCompleted,
    booksCurrentlyReading,
    booksWantToRead,
    booksDropped,
    totalPagesRead,
    totalBooks: entries.length,
    streakDays,
    categoryDistribution,
  };

  return { data: stats, error: null };
}
