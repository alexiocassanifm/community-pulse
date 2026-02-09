import { createAuthClient } from "@/lib/supabase/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection: verify Origin header matches our host
    const headersList = await headers();
    const origin = headersList.get("origin");
    const host = headersList.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { message: "Failed to sign out" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
