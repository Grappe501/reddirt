import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Legacy endpoint — Phase 3 routes all structured intake through `POST /api/forms`.
 */
export async function GET() {
  return NextResponse.json({
    ok: false,
    movedTo: "/api/forms",
    message: "Use POST /api/forms with a discriminated formType payload.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      movedTo: "/api/forms",
      message: "Intake is handled by POST /api/forms (Zod-validated, persisted, classified).",
    },
    { status: 410 },
  );
}
