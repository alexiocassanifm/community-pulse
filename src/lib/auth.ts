import { createAuthClient } from "@/lib/supabase/auth-server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createAuthClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/dashboard/login");
  }
  return user;
}

export async function isOrganizer(userId: string): Promise<boolean> {
  const supabase = await createAuthClient();
  const { data } = await supabase
    .from("organizers")
    .select("id")
    .eq("id", userId)
    .single();
  return !!data;
}
