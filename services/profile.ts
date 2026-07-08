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
    .maybeSingle();

  return { data, error };
}
export async function updateProfile(profile: {
  username: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  return await supabase
    .from("profiles")
    .update({
      username: profile.username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}