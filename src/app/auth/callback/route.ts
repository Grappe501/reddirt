import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNext(value: string | null): string {
  if (!value) return "/admin/events";
  if (!value.startsWith("/") || value.startsWith("//") || !value.startsWith("/admin/")) return "/admin/events";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/admin/event-pm-login?error=oauth", request.url));

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/admin/event-pm-login?error=oauth", request.url));
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/event-pm-login?error=config", request.url));
  }
}
