import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Validate user with Supabase Auth server (not just cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/dashboard/login";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Authenticated user on login page -> redirect to dashboard
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user on protected route -> redirect to login
  if (isProtectedRoute && !isLoginPage && !user) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated non-organizer on protected route -> sign out and redirect
  if (isProtectedRoute && !isLoginPage && user) {
    const { data: organizer } = await supabase
      .from("organizers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!organizer) {
      await supabase.auth.signOut();
      const loginUrl = new URL("/dashboard/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
