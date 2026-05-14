import { PrismaClient } from "@prisma/client";

import { loadEmailSuppressions, normalizeEmail, isValidEmail } from "@/lib/email/email-staged-store";

export type EmailAudienceMember = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  county?: string;
  city?: string;
  source: string;
  consentStatus: "opted_in" | "relationship" | "unknown" | "do_not_contact";
  tags: string[];
};

export type EmailAudienceBuildResult = {
  eligible: EmailAudienceMember[];
  needsReview: EmailAudienceMember[];
  suppressedCount: number;
  duplicateCount: number;
  invalidCount: number;
  totalConsidered: number;
};

function splitName(name?: string | null): { firstName?: string; lastName?: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};
  return { firstName: parts[0], lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined };
}

function suppressionStateBlocks(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const text = JSON.stringify(value).toLowerCase();
  return ["bounce", "blocked", "spam", "unsubscribe", "suppressed"].some((needle) => text.includes(needle));
}

function addCandidate(args: {
  rows: EmailAudienceMember[];
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  county?: string | null;
  city?: string | null;
  source: string;
  consentStatus: EmailAudienceMember["consentStatus"];
  tags: string[];
}) {
  if (!args.email) return;
  args.rows.push({
    id: args.id,
    email: normalizeEmail(args.email),
    firstName: args.firstName ?? undefined,
    lastName: args.lastName ?? undefined,
    county: args.county ?? undefined,
    city: args.city ?? undefined,
    source: args.source,
    consentStatus: args.consentStatus,
    tags: [...new Set(args.tags)],
  });
}

export async function buildEmailAudience(opts: {
  prisma?: PrismaClient;
  includeNeedsReview?: boolean;
  repoRoot?: string;
} = {}): Promise<EmailAudienceBuildResult> {
  const prisma = opts.prisma ?? new PrismaClient();
  const ownClient = !opts.prisma;
  const candidates: EmailAudienceMember[] = [];
  let invalidCount = 0;
  let duplicateCount = 0;
  let suppressedCount = 0;

  try {
    const [users, eventSignups, commitments, roles] = await Promise.all([
      prisma.user.findMany({
        take: 5000,
        include: { contactPreference: true, volunteerProfile: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.eventSignup.findMany({
        take: 5000,
        include: { county: { select: { displayName: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.commitment.findMany({
        where: { type: "gotv_commitment_card" },
        take: 5000,
        include: { user: { include: { contactPreference: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.teamRoleAssignment.findMany({
        take: 2500,
        include: {
          user: { include: { contactPreference: true } },
          county: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    for (const user of users) {
      const pref = user.contactPreference;
      const tags = [...user.interests];
      if (user.volunteerProfile) tags.push("volunteer");
      const consentStatus =
        pref?.globalUnsubscribeAt || suppressionStateBlocks(pref?.sendgridSuppressionState)
          ? "do_not_contact"
          : pref?.emailOptInStatus === "OPT_IN"
            ? "opted_in"
            : user.volunteerProfile
              ? "relationship"
              : "unknown";
      const name = splitName(user.name);
      addCandidate({
        rows: candidates,
        id: `user:${user.id}`,
        email: user.email,
        firstName: name.firstName,
        lastName: name.lastName,
        county: user.county,
        source: user.volunteerProfile ? "volunteer_profile" : "user",
        consentStatus,
        tags,
      });
    }

    for (const signup of eventSignups) {
      addCandidate({
        rows: candidates,
        id: `event_signup:${signup.id}`,
        email: signup.email,
        firstName: signup.firstName,
        lastName: signup.lastName,
        county: signup.county?.displayName,
        source: "event_attendee",
        consentStatus: "relationship",
        tags: ["event_attendee", signup.signupSource],
      });
    }

    for (const commitment of commitments) {
      const pref = commitment.user.contactPreference;
      const metadata = commitment.metadata && typeof commitment.metadata === "object" ? commitment.metadata as { optIns?: { email?: boolean }; city?: string; county?: string } : {};
      const name = splitName(commitment.user.name);
      const consentStatus =
        pref?.globalUnsubscribeAt || suppressionStateBlocks(pref?.sendgridSuppressionState)
          ? "do_not_contact"
          : pref?.emailOptInStatus === "OPT_IN" || metadata.optIns?.email === true
            ? "opted_in"
            : "unknown";
      addCandidate({
        rows: candidates,
        id: `commitment:${commitment.id}`,
        email: commitment.user.email,
        firstName: name.firstName,
        lastName: name.lastName,
        county: metadata.county ?? commitment.user.county,
        city: metadata.city,
        source: "commitment_card_signup",
        consentStatus,
        tags: ["commitment_card_signup", "gotv_commitment"],
      });
    }

    for (const role of roles) {
      const pref = role.user.contactPreference;
      const name = splitName(role.user.name);
      addCandidate({
        rows: candidates,
        id: `team_role:${role.id}`,
        email: role.user.email,
        firstName: name.firstName,
        lastName: name.lastName,
        county: role.county?.displayName ?? role.user.county,
        source: role.roleKey.includes("guide") ? "local_guide" : "county_host",
        consentStatus:
          pref?.globalUnsubscribeAt || suppressionStateBlocks(pref?.sendgridSuppressionState)
            ? "do_not_contact"
            : pref?.emailOptInStatus === "OPT_IN"
              ? "opted_in"
              : "relationship",
        tags: ["county_role", role.roleKey],
      });
    }

    const stagedSuppressions = await loadEmailSuppressions(opts.repoRoot);
    const suppressedEmails = new Set(stagedSuppressions.map((s) => normalizeEmail(s.email)));
    const seen = new Set<string>();
    const eligible: EmailAudienceMember[] = [];
    const needsReview: EmailAudienceMember[] = [];

    for (const candidate of candidates) {
      if (!isValidEmail(candidate.email)) {
        invalidCount += 1;
        continue;
      }
      if (seen.has(candidate.email)) {
        duplicateCount += 1;
        continue;
      }
      seen.add(candidate.email);
      if (suppressedEmails.has(candidate.email) || candidate.consentStatus === "do_not_contact") {
        suppressedCount += 1;
        continue;
      }
      if (candidate.consentStatus === "opted_in" || candidate.consentStatus === "relationship") eligible.push(candidate);
      else needsReview.push(candidate);
    }

    return { eligible, needsReview, suppressedCount, duplicateCount, invalidCount, totalConsidered: candidates.length };
  } catch {
    return { eligible: [], needsReview: [], suppressedCount, duplicateCount, invalidCount, totalConsidered: candidates.length };
  } finally {
    if (ownClient) await prisma.$disconnect().catch(() => {});
  }
}
