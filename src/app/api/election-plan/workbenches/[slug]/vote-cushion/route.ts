import { NextResponse } from "next/server";

import { requireElectionPlanOperator } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const { slug } = await context.params;
  try {
    const row = await prisma.communityWorkbenchVoteCushion.findUnique({ where: { workbenchSlug: slug } });
    return NextResponse.json({ cushion: row });
  } catch {
    return NextResponse.json({ cushion: null });
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator" || !auth.operator) {
    return NextResponse.json({ error: "Operator initials sign-in required" }, { status: 403 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as {
    label?: string;
    targetIncreasePct?: number | null;
    targetVotes?: number | null;
    notes?: string;
    clear?: boolean;
  };

  if (body.clear) {
    try {
      await prisma.communityWorkbenchVoteCushion.deleteMany({ where: { workbenchSlug: slug } });
    } catch {
      // table may not exist yet
    }
    return NextResponse.json({ ok: true, cleared: true });
  }

  const pctRaw = body.targetIncreasePct;
  const votesRaw = body.targetVotes;
  const targetIncreasePct =
    pctRaw === null || pctRaw === undefined || pctRaw === ("" as unknown as number)
      ? null
      : Number(pctRaw);
  const targetVotes =
    votesRaw === null || votesRaw === undefined || votesRaw === ("" as unknown as number)
      ? null
      : Math.round(Number(votesRaw));

  if (targetIncreasePct == null && targetVotes == null) {
    return NextResponse.json({ error: "Set targetIncreasePct or targetVotes, or send clear: true" }, { status: 400 });
  }
  if (targetIncreasePct != null && (Number.isNaN(targetIncreasePct) || targetIncreasePct < 0 || targetIncreasePct > 500)) {
    return NextResponse.json({ error: "targetIncreasePct must be 0–500" }, { status: 400 });
  }
  if (targetVotes != null && (Number.isNaN(targetVotes) || targetVotes < 1)) {
    return NextResponse.json({ error: "targetVotes must be a positive integer" }, { status: 400 });
  }

  try {
    const row = await prisma.communityWorkbenchVoteCushion.upsert({
      where: { workbenchSlug: slug },
      create: {
        workbenchSlug: slug,
        label: body.label?.trim() || null,
        targetIncreasePct: targetVotes != null ? null : targetIncreasePct,
        targetVotes: targetVotes ?? null,
        notes: body.notes?.trim() || null,
        operatorInitials: auth.operator.initials,
      },
      update: {
        label: body.label?.trim() || null,
        targetIncreasePct: targetVotes != null ? null : targetIncreasePct,
        targetVotes: targetVotes ?? null,
        notes: body.notes?.trim() || null,
        operatorInitials: auth.operator.initials,
      },
    });
    return NextResponse.json({ ok: true, cushion: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
