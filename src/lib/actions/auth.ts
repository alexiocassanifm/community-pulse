"use server";

import { createAuthClient } from "@/lib/supabase/auth-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInAction(email: string, password: string) {
  const supabase = await createAuthClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Generic message to prevent username enumeration
    return { error: "Invalid email or password" };
  }

  // Verify the authenticated user is in the organizers table
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!organizer) {
    // User exists in auth but not an organizer - sign them out
    await supabase.auth.signOut();
    return { error: "You are not authorized to access the dashboard" };
  }

  revalidatePath("/dashboard", "layout");
  return { error: null };
}

export async function signOutAction() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/login");
}
