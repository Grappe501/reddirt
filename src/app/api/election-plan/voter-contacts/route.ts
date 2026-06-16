import { NextResponse } from "next/server";
import type { ElectionPlanVoterContactStatus } from "@prisma/client";

import {
  getElectionPlanOperatorFromRequest,
  requireElectionPlanApiSession,
  requireElectionPlanOperator,
} from "@/lib/election-plan/auth/require-election-plan-api";
import { loadVoterContactsForWorkbench } from "@/lib/election-plan/voter-contact/load-voter-contacts";
import { VOTER_CONTACT_STATUSES } from "@/lib/election-plan/voter-contact/types";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const MAX_PHOTO_CHARS = 800_000;
const VALID_STATUSES = new Set<string>(VOTER_CONTACT_STATUSES.map((s) => s.value));

export async function GET(request: Request) {
  if (!(await requireElectionPlanApiSession())) {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workbenchSlug = searchParams.get("workbenchSlug")?.trim();
  if (!workbenchSlug) {
    return NextResponse.json({ error: "workbenchSlug required" }, { status: 400 });
  }

  const summary = await loadVoterContactsForWorkbench(workbenchSlug);
  const operator = await getElectionPlanOperatorFromRequest();
  return NextResponse.json({ ...summary, operator });
}

export async function POST(request: Request) {
  const auth = await requireElectionPlanOperator();
  if (auth.error === "session") {
    return NextResponse.json({ error: "Election Plan authentication required" }, { status: 401 });
  }
  if (auth.error === "operator") {
    return NextResponse.json(
      { error: "Sign in with your 3-letter initials before capturing contacts." },
      { status: 403 },
    );
  }
  if (auth.error === "capability" || !auth.operator) {
    return NextResponse.json({ error: "Your operator account cannot capture contacts." }, { status: 403 });
  }

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    interestVolunteer?: boolean;
    interestDonor?: boolean;
    interestLeadership?: boolean;
    interestHost?: boolean;
    notes?: string;
    photoDataUrl?: string;
    countySlug?: string;
    citySlug?: string | null;
    workbenchSlug?: string;
    eventSlug?: string;
    eventLabel?: string;
  };

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name required" }, { status: 400 });
  }

  const countySlug = String(body.countySlug ?? "").trim().toLowerCase();
  if (!countySlug) {
    return NextResponse.json({ error: "countySlug required" }, { status: 400 });
  }

  const photoDataUrl = body.photoDataUrl?.trim() || null;
  if (photoDataUrl && photoDataUrl.length > MAX_PHOTO_CHARS) {
    return NextResponse.json({ error: "Photo too large — try a smaller image" }, { status: 400 });
  }

  const op = auth.operator;
  if (op.countySlug && op.capabilities.includes("county_scope") && op.countySlug !== countySlug) {
    return NextResponse.json(
      { error: `Your operator account (${op.initials}) is scoped to ${op.countySlug} county only.` },
      { status: 403 },
    );
  }

  try {
    const contact = await prisma.electionPlanVoterContact.create({
      data: {
        operatorId: op.id,
        operatorInitials: op.initials,
        firstName: firstName.slice(0, 100),
        lastName: lastName.slice(0, 100),
        email: body.email?.trim().slice(0, 200) || null,
        phone: body.phone?.trim().slice(0, 50) || null,
        interestVolunteer: Boolean(body.interestVolunteer),
        interestDonor: Boolean(body.interestDonor),
        interestLeadership: Boolean(body.interestLeadership),
        interestHost: Boolean(body.interestHost),
        notes: body.notes?.trim().slice(0, 2000) || null,
        photoDataUrl,
        countySlug,
        citySlug: body.citySlug?.trim().toLowerCase() || null,
        workbenchSlug: body.workbenchSlug?.trim() || null,
        eventSlug: body.eventSlug?.trim() || null,
        eventLabel: body.eventLabel?.trim().slice(0, 200) || null,
      },
    });

    return NextResponse.json({
      ok: true,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        href: `/election-plan/workbenches/${body.workbenchSlug ?? "quitman"}/contacts/${contact.id}`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not save contact — is the database migration applied?" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireElectionPlanOperator();
  if (auth.error || !auth.operator) {
    return NextResponse.json({ error: "Operator sign-in required" }, { status: auth.error === "session" ? 401 : 403 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: string;
    notes?: string;
    interestVolunteer?: boolean;
    interestDonor?: boolean;
    interestLeadership?: boolean;
    interestHost?: boolean;
    email?: string;
    phone?: string;
  };

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.status != null) {
    if (!VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status as ElectionPlanVoterContactStatus;
  }
  if (body.notes !== undefined) data.notes = body.notes?.trim().slice(0, 2000) || null;
  if (body.interestVolunteer !== undefined) data.interestVolunteer = Boolean(body.interestVolunteer);
  if (body.interestDonor !== undefined) data.interestDonor = Boolean(body.interestDonor);
  if (body.interestLeadership !== undefined) data.interestLeadership = Boolean(body.interestLeadership);
  if (body.interestHost !== undefined) data.interestHost = Boolean(body.interestHost);
  if (body.email !== undefined) data.email = body.email?.trim().slice(0, 200) || null;
  if (body.phone !== undefined) data.phone = body.phone?.trim().slice(0, 50) || null;

  try {
    const updated = await prisma.electionPlanVoterContact.update({ where: { id }, data });
    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch {
    return NextResponse.json({ error: "Contact not found or update failed" }, { status: 404 });
  }
}
