import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { handleRouteError } from "@/lib/api/helpers";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      console.error("Fetch settings error:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return handleRouteError("GET /api/settings", err);
  }
}
