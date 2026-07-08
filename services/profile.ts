import { supabase } from "../lib/supabase";

export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data, error };
}
export async function updateProfile(profile: {
  username: string;
  full_name: string;
  bio: string;
  favorite_genre: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  return await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });
}