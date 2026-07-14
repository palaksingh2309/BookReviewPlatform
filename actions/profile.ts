"use server";

import { createClient } from "../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { updateProfile } from "../services/profile";
import { profileSchema } from "../lib/validators";

export async function updateProfileAction(formData: {
  username: string;
  full_name?: string | null;
  bio?: string | null;
  favorite_genre?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const result = profileSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { data, error } = await updateProfile(result.data, supabase);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/feed");
  return { success: true, data };
}
