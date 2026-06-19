import { NextResponse } from "next/server";

import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeCityName(raw: unknown): string | null {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) return null;
  return name;
}

export async function POST(request: Request) {
  if (!(await requireElectionPlanApiSession())) {
    return NextResponse.json({ ok: false, error: "Election Plan authentication required" }, { status: 401 });
  }

  const body = (await request.json()) as {
    cityName?: string;
    wantSpecialKpiProfile?: boolean;
    note?: string;
  };

  const cityName = sanitizeCityName(body.cityName);
  if (!cityName) {
    return NextResponse.json({ ok: false, error: "cityName required" }, { status: 400 });
  }

  const wantSpecialKpiProfile = Boolean(body.wantSpecialKpiProfile);
  const note = body.note?.trim() ? String(body.note).trim().slice(0, 500) : null;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: "Request accepted locally — database not configured in this environment.",
    });
  }

  try {
    const intake = await prisma.workflowIntake.create({
      data: {
        status: "PENDING",
        title: wantSpecialKpiProfile
          ? `City profile request — ${cityName}`
          : `City lookup — not priority (${cityName})`,
        source: "election_plan_city_profile_request",
        metadata: {
          cityName,
          wantSpecialKpiProfile,
          note,
          page: "/election-plan/cities",
          requestedAt: new Date().toISOString(),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, persisted: true, workflowIntakeId: intake.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save request" }, { status: 500 });
  }
}
