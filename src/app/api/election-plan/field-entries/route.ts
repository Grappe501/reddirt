import { NextResponse } from "next/server";
import type { ElectionPlanFieldCategory } from "@prisma/client";

import { resolveFieldEntryOperator, requireFieldEntryOperator, requireFieldEntrySession } from "@/lib/volunteers/field-entry-access";
import { syncFieldEntryContactSpine } from "@/lib/volunteers/contact-spine";
import { loadFieldEntriesForLocation } from "@/lib/election-plan/field-entry/load-field-entries";
import { FIELD_ENTRY_CATEGORIES, type FieldEntryCategory } from "@/lib/election-plan/field-entry/types";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const VALID_CATEGORIES = new Set<string>(FIELD_ENTRY_CATEGORIES.map((c) => c.value));

export async function GET(request: Request) {
  if (!(await requireFieldEntrySession())) {
    return NextResponse.json({ error: "Sign in to view field entries" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countySlug = searchParams.get("countySlug")?.trim();
  if (!countySlug) {
    return NextResponse.json({ error: "countySlug required" }, { status: 400 });
  }
  const citySlug = searchParams.get("citySlug")?.trim() || null;
  const summary = await loadFieldEntriesForLocation({ countySlug, citySlug });
  const operator = await resolveFieldEntryOperator();

  return NextResponse.json({
    ...summary,
    operator: operator
      ? { initials: operator.initials, displayName: operator.displayName, source: operator.source }
      : null,
  });
}

export async function POST(request: Request) {
  const auth = await requireFieldEntryOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator") {
    return NextResponse.json(
      { error: "Sign in with your 3-letter initials before logging field results." },
      { status: 403 },
    );
  }
  if (auth.error === "capability" || !auth.operator) {
    return NextResponse.json({ error: "Your operator account cannot log field entries." }, { status: 403 });
  }

  const body = (await request.json()) as {
    category?: string;
    label?: string;
    description?: string;
    quantity?: number;
    countySlug?: string;
    citySlug?: string | null;
    linkToCrm?: boolean;
  };

  const category = String(body.category ?? "").trim();
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const label = String(body.label ?? "").trim();
  if (label.length < 1 || label.length > 200) {
    return NextResponse.json({ error: "Label required (max 200 characters)" }, { status: 400 });
  }

  const countySlug = String(body.countySlug ?? "").trim().toLowerCase();
  if (!countySlug) {
    return NextResponse.json({ error: "countySlug required" }, { status: 400 });
  }

  const citySlug = body.citySlug?.trim().toLowerCase() || null;
  const description = body.description?.trim() ? String(body.description).trim().slice(0, 2000) : null;
  const quantity = Math.max(1, Math.min(10000, Math.floor(Number(body.quantity) || 1)));

  const op = auth.operator;
  if (op.countySlug && op.capabilities.includes("county_scope") && op.countySlug !== countySlug) {
    return NextResponse.json(
      { error: `Your operator account (${op.initials}) is scoped to ${op.countySlug} county only.` },
      { status: 403 },
    );
  }

  try {
    const entry = await prisma.electionPlanFieldEntry.create({
      data: {
        operatorId: op.id,
        operatorInitials: op.initials,
        category: category as ElectionPlanFieldCategory,
        label,
        description,
        quantity,
        countySlug,
        citySlug,
      },
      include: { operator: { select: { displayName: true } } },
    });

    const spine = await syncFieldEntryContactSpine({
      fieldEntryId: entry.id,
      operatorInitials: op.initials,
      category: category as ElectionPlanFieldCategory,
      label,
      description,
      countySlug,
      citySlug,
      linkToCrm: body.linkToCrm !== false,
    }).catch(() => ({ linked: false, relationalContactId: null, created: false }));

    return NextResponse.json({
      ok: true,
      entry: {
        id: entry.id,
        operatorInitials: entry.operatorInitials,
        operatorDisplayName: entry.operator.displayName,
        category: entry.category,
        label: entry.label,
        description: entry.description,
        quantity: entry.quantity,
        countySlug: entry.countySlug,
        citySlug: entry.citySlug,
        createdAt: entry.createdAt.toISOString(),
        relationalContactId: spine.relationalContactId,
      },
      contactSpine: spine,
    });
  } catch {
    return NextResponse.json({ error: "Could not save entry — is the database migration applied?" }, { status: 503 });
  }
}
