"use server";

import { createClient } from "../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { upsertReadingListEntry, deleteReadingListEntry } from "../services/reading-list";
import { readingListSchema } from "../lib/validators";

export async function upsertReadingListAction(formData: {
  book_id: string;
  status: 'want-to-read' | 'currently-reading' | 'completed' | 'dropped';
  progress_pages: number;
  total_pages: number;
  is_favorite: boolean;
  notes?: string | null;
}) {
  const supabase = await createClient();

  const result = readingListSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  if (formData.progress_pages > formData.total_pages) {
    return { success: false, error: "Pages read cannot exceed total pages" };
  }

  const { data, error } = await upsertReadingListEntry(formData, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/reading-list");
  revalidatePath("/dashboard");
  revalidatePath("/books");
  return { success: true, data };
}

export async function deleteReadingListAction(bookId: string) {
  const supabase = await createClient();
  const { error } = await deleteReadingListEntry(bookId, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/reading-list");
  revalidatePath("/dashboard");
  revalidatePath("/books");
  return { success: true };
}
