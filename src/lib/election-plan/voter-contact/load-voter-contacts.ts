import type { ElectionPlanVoterContactStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

import type { VoterContactListSummary, VoterContactRow } from "./types";

function mapRow(row: {
  id: string;
  operatorInitials: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  interestVolunteer: boolean;
  interestDonor: boolean;
  interestLeadership: boolean;
  interestHost: boolean;
  notes: string | null;
  photoDataUrl: string | null;
  countySlug: string;
  citySlug: string | null;
  workbenchSlug: string | null;
  eventSlug: string | null;
  eventLabel: string | null;
  status: ElectionPlanVoterContactStatus;
  createdAt: Date;
  updatedAt: Date;
}): VoterContactRow {
  return {
    id: row.id,
    operatorInitials: row.operatorInitials,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    interestVolunteer: row.interestVolunteer,
    interestDonor: row.interestDonor,
    interestLeadership: row.interestLeadership,
    interestHost: row.interestHost,
    notes: row.notes,
    hasPhoto: Boolean(row.photoDataUrl?.trim()),
    photoDataUrl: row.photoDataUrl,
    countySlug: row.countySlug,
    citySlug: row.citySlug,
    workbenchSlug: row.workbenchSlug,
    eventSlug: row.eventSlug,
    eventLabel: row.eventLabel,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function loadVoterContactsForWorkbench(
  workbenchSlug: string,
  limit = 100,
): Promise<VoterContactListSummary> {
  try {
    const rows = await prisma.electionPlanVoterContact.findMany({
      where: { workbenchSlug },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const contacts = rows.map(mapRow);
    return { contacts, total: contacts.length };
  } catch {
    return { contacts: [], total: 0 };
  }
}

export async function loadVoterContactById(id: string): Promise<VoterContactRow | null> {
  try {
    const row = await prisma.electionPlanVoterContact.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  } catch {
    return null;
  }
}

export async function countVoterContactsForWorkbench(workbenchSlug: string): Promise<number> {
  try {
    return await prisma.electionPlanVoterContact.count({ where: { workbenchSlug } });
  } catch {
    return 0;
  }
}
