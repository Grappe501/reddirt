/**
 * REL-3: light duplicate *signals* only (same owner). No merge, no cross-user access.
 */

import { prisma } from "@/lib/db";

function digits10(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return null;
  return d.slice(-10);
}

function normName(s: string | null | undefined): string {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function fullDisplayName(first: string | null, last: string | null, display: string): string {
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || display.trim();
}

/** Simple similarity: exact match, or one normalized string contains the other (min length 3). */
export function simpleSimilarName(a: string, b: string): boolean {
  const an = a.trim().toLowerCase();
  const bn = b.trim().toLowerCase();
  if (an.length < 2 || bn.length < 2) return false;
  if (an === bn) return true;
  if (an.length >= 3 && bn.length >= 3) {
    return an.includes(bn) || bn.includes(an);
  }
  return false;
}

/**
 * Returns other RelationalContact ids (same owner) that might be duplicates. Read-only.
 */
export async function findPotentialDuplicates(
  contactId: string,
  ownerUserId: string,
): Promise<string[]> {
  const contact = await prisma.relationalContact.findFirst({
    where: { id: contactId, ownerUserId },
  });
  if (!contact) return [];

  const others = await prisma.relationalContact.findMany({
    where: {
      ownerUserId,
      id: { not: contactId },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      phone: true,
      email: true,
    },
  });

  const p10 = digits10(contact.phone);
  const e = contact.email?.trim().toLowerCase() || null;
  const n1 = fullDisplayName(contact.firstName, contact.lastName, contact.displayName);

  const dups: string[] = [];
  for (const o of others) {
    const oP = digits10(o.phone);
    const oE = o.email?.trim().toLowerCase() || null;
    const oN = fullDisplayName(o.firstName, o.lastName, o.displayName);
    if (p10 && oP && p10 === oP) {
      dups.push(o.id);
      continue;
    }
    if (e && oE && e === oE) {
      dups.push(o.id);
      continue;
    }
    if (n1 && oN && simpleSimilarName(n1, oN)) {
      dups.push(o.id);
    }
  }

  return [...new Set(dups)];
}
