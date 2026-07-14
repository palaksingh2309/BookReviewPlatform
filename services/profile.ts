import { supabase as defaultSupabase } from "../lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(supabase = defaultSupabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { data, error };
}

export async function updateProfile(
  profile: {
    username: string;
    full_name?: string | null;
    bio?: string | null;
    favorite_genre?: string | null;
  },
  supabase: SupabaseClient = defaultSupabase
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("User not authenticated") };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: profile.username.trim(),
      full_name: profile.full_name?.trim() || null,
      bio: profile.bio?.trim() || null,
      favorite_genre: profile.favorite_genre || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  return { data, error };
}
