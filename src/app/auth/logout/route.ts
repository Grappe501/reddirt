import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Logout remains safe/idempotent if auth configuration is unavailable.
  }
  return NextResponse.redirect(new URL("/admin/event-pm-login", request.url), { status: 303 });
}
