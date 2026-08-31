import { prisma } from "@/lib/db";
import { TALENT_FOUNDRY_SOURCE } from "./constants";
import { extractTalentFoundryBlob } from "./evidence-map";
import { isUnreviewed, parseStaffState } from "./staff-state";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const include = {
  assignedUser: { select: { id: true, name: true, email: true } },
  submission: {
    select: {
      id: true,
      structuredData: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          zip: true,
          county: true,
        },
      },
    },
  },
} as const;

export type TalentFoundryIntakeRow = Awaited<ReturnType<typeof loadTalentFoundryIntakes>>[number];

function isTalentFoundryMetadata(metadata: unknown): boolean {
  if (!isRecord(metadata)) return false;
  if (metadata.sourceCampaign === TALENT_FOUNDRY_SOURCE) return true;
  return isRecord(metadata.talentFoundry) && metadata.talentFoundry.source === TALENT_FOUNDRY_SOURCE;
}

export async function loadTalentFoundryIntakes() {
  try {
    return await prisma.workflowIntake.findMany({
      where: {
        OR: [
          { metadata: { path: ["sourceCampaign"], equals: TALENT_FOUNDRY_SOURCE } },
          { metadata: { path: ["talentFoundry", "source"], equals: TALENT_FOUNDRY_SOURCE } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 400,
      include,
    });
  } catch (e) {
    console.error("[talent-foundry] JSON path query failed, using source=volunteer fallback", e);
    const rows = await prisma.workflowIntake.findMany({
      where: { source: "volunteer" },
      orderBy: { updatedAt: "desc" },
      take: 800,
      include,
    });
    return rows.filter((row) => isTalentFoundryMetadata(row.metadata));
  }
}

export async function loadTalentFoundryIntake(id: string) {
  const row = await prisma.workflowIntake.findUnique({
    where: { id },
    include: {
      ...include,
      actions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          kind: true,
          summary: true,
          createdAt: true,
          metadata: true,
        },
      },
    },
  });
  if (!row || !isTalentFoundryMetadata(row.metadata)) return null;
  return row;
}

export type TalentFoundryListFilter = {
  q?: string;
  view?: "all" | "rank";
  filter?: string;
  pathway?: string;
  interview?: string;
  intern?: string;
  owner?: "needs" | "assigned" | "";
  keyOne?: "yes" | "";
  complete?: "yes" | "";
};

export function matchesListFilter(
  row: TalentFoundryIntakeRow,
  f: TalentFoundryListFilter,
): boolean {
  const staff = parseStaffState(row.metadata);
  const blob = extractTalentFoundryBlob(row.metadata, row.submission?.structuredData);
  const flags = isRecord(blob.flags) ? blob.flags : {};
  const routing = isRecord(blob.routing) ? blob.routing : {};
  const user = row.submission?.user;
  const city = isRecord(row.metadata) && typeof row.metadata.city === "string" ? row.metadata.city : "";

  if (f.q && f.q.trim().length >= 2) {
    const q = f.q.trim().toLowerCase();
    const hay = [
      user?.name,
      user?.email,
      user?.phone,
      user?.zip,
      user?.county,
      city,
      row.title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }

  if (f.filter === "unreviewed" && !isUnreviewed(staff)) return false;
  if (f.filter === "paid") {
    const paid = routing.paidInterest;
    if (paid !== "yes" && paid !== "both") return false;
  }
  if (f.filter === "volunteer") {
    const c = flags.volunteerCommitment;
    if (c !== "yes" && c !== "limited") return false;
  }
  if (f.filter === "headquarters") {
    if (routing.littleRock !== "yes" && staff.pathway !== "headquarters" && routing.pathwayId !== "headquarters") {
      return false;
    }
  }
  if (f.filter === "remote") {
    if (routing.remote !== "yes" && staff.pathway !== "remote" && routing.pathwayId !== "remote") return false;
  }
  if (f.filter === "leadership") {
    if (routing.leadership !== "yes" && staff.pathway !== "local_leader" && routing.pathwayId !== "local_leader") {
      return false;
    }
  }
  if (f.filter === "keyOne" && flags.keyOne !== true) return false;
  if (f.filter === "complete" && flags.requiredScenarioComplete !== true) return false;
  if (f.pathway && staff.pathway !== f.pathway && routing.pathwayId !== f.pathway) return false;
  if (f.interview && staff.interviewStatus !== f.interview) return false;
  if (f.intern && staff.internDecision !== f.intern) return false;
  if (f.owner === "needs" && row.assignedUserId) return false;
  if (f.owner === "assigned" && !row.assignedUserId) return false;
  if (f.keyOne === "yes" && flags.keyOne !== true) return false;
  if (f.complete === "yes" && flags.requiredScenarioComplete !== true) return false;
  return true;
}

export function summarizeIntakes(rows: TalentFoundryIntakeRow[]) {
  return {
    total: rows.length,
    unreviewed: rows.filter((r) => isUnreviewed(parseStaffState(r.metadata))).length,
    paid: rows.filter((r) => {
      const paid = extractTalentFoundryBlob(r.metadata, r.submission?.structuredData).routing;
      const v = isRecord(paid) ? paid.paidInterest : null;
      return v === "yes" || v === "both";
    }).length,
    interview: rows.filter((r) => {
      const s = parseStaffState(r.metadata).interviewStatus;
      return s === "interview_requested" || s === "interview_assigned";
    }).length,
    volunteer: rows.filter((r) => {
      const flags = extractTalentFoundryBlob(r.metadata, r.submission?.structuredData).flags;
      const c = isRecord(flags) ? flags.volunteerCommitment : null;
      return c === "yes" || c === "limited";
    }).length,
    needsOwner: rows.filter((r) => !r.assignedUserId).length,
  };
}
