import { WorkflowIntakeStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

/** Public form sources that feed the volunteer activation pipeline. */
export const VOLUNTEER_INTAKE_SOURCES = ["volunteer", "join_movement", "local_team"] as const;

export type VolunteerIntakePipelineStage = "pending" | "in_review" | "activated" | "closed";

export type VolunteerIntakeQueueRow = {
  id: string;
  status: WorkflowIntakeStatus;
  pipelineStage: VolunteerIntakePipelineStage;
  title: string | null;
  source: string | null;
  createdAt: string;
  county: string | null;
  city: string | null;
  zip: string | null;
  preferredRole: string | null;
  preferredLanguage: string | null;
  leadershipInterest: boolean | null;
  student: boolean | null;
  schoolCampus: string | null;
  interests: string[];
  hostingInterest: boolean | null;
  fundraisingInterest: boolean | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  hasVolunteerProfile: boolean;
  volunteerTeamSlug: string | null;
  submissionId: string | null;
  detailHref: string;
};

export type VolunteerIntakeDashboardPayload = {
  dbAvailable: boolean;
  stats: {
    pending: number;
    inReview: number;
    awaitingInfo: number;
    activated: number;
    declined: number;
    signupSheetPending: number;
    profilesTotal: number;
  };
  pipeline: Array<{ stage: VolunteerIntakePipelineStage; label: string; count: number; description: string }>;
  queue: VolunteerIntakeQueueRow[];
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function pipelineStage(status: WorkflowIntakeStatus): VolunteerIntakePipelineStage {
  if (status === "PENDING") return "pending";
  if (status === "IN_REVIEW" || status === "AWAITING_INFO" || status === "READY_FOR_CALENDAR") return "in_review";
  if (status === "CONVERTED") return "activated";
  return "closed";
}

function metaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function metaBool(meta: Record<string, unknown>, key: string): boolean | null {
  const v = meta[key];
  return typeof v === "boolean" ? v : null;
}

function metaStringArray(meta: Record<string, unknown>, key: string): string[] {
  const v = meta[key];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function teamSlugFromSubmission(structured: unknown): string | null {
  if (!isRecord(structured)) return null;
  const v = structured.volunteerTeamSlug;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

const EMPTY: VolunteerIntakeDashboardPayload = {
  dbAvailable: false,
  stats: {
    pending: 0,
    inReview: 0,
    awaitingInfo: 0,
    activated: 0,
    declined: 0,
    signupSheetPending: 0,
    profilesTotal: 0,
  },
  pipeline: [
    { stage: "pending", label: "Pending review", count: 0, description: "New public form submissions" },
    { stage: "in_review", label: "In review", count: 0, description: "Operator assigned — placement in progress" },
    { stage: "activated", label: "Activated", count: 0, description: "Converted — workbench unlocked or team provisioned" },
    { stage: "closed", label: "Closed", count: 0, description: "Declined or archived" },
  ],
  queue: [],
};

export async function loadVolunteerIntakeDashboard(): Promise<VolunteerIntakeDashboardPayload> {
  if (!isDatabaseConfigured()) return EMPTY;

  try {
    const [
      intakes,
      signupSheetPending,
      profilesTotal,
      statusGroups,
    ] = await Promise.all([
      prisma.workflowIntake.findMany({
        where: { source: { in: [...VOLUNTEER_INTAKE_SOURCES] } },
        orderBy: { createdAt: "desc" },
        take: 120,
        include: {
          submission: {
            select: {
              id: true,
              structuredData: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  volunteerProfile: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
      prisma.signupSheetEntry.count({ where: { approvalStatus: "PENDING_REVIEW" } }),
      prisma.volunteerProfile.count(),
      prisma.workflowIntake.groupBy({
        by: ["status"],
        where: { source: { in: [...VOLUNTEER_INTAKE_SOURCES] } },
        _count: { _all: true },
      }),
    ]);

    const statusCount = new Map(statusGroups.map((g) => [g.status, g._count._all]));

    const stats = {
      pending: statusCount.get("PENDING") ?? 0,
      inReview: statusCount.get("IN_REVIEW") ?? 0,
      awaitingInfo: statusCount.get("AWAITING_INFO") ?? 0,
      activated: statusCount.get("CONVERTED") ?? 0,
      declined: (statusCount.get("DECLINED") ?? 0) + (statusCount.get("ARCHIVED") ?? 0),
      signupSheetPending,
      profilesTotal,
    };

    const pipeline = [
      {
        stage: "pending" as const,
        label: "Pending review",
        count: stats.pending,
        description: "New website sign-ups awaiting first operator touch",
      },
      {
        stage: "in_review" as const,
        label: "In review",
        count: stats.inReview + stats.awaitingInfo + (statusCount.get("READY_FOR_CALENDAR") ?? 0),
        description: "Operator reviewing skills, geography, and placement options",
      },
      {
        stage: "activated" as const,
        label: "Activated",
        count: stats.activated,
        description: "Marked converted — volunteer profile and team path confirmed",
      },
      {
        stage: "closed" as const,
        label: "Closed",
        count: stats.declined,
        description: "Declined or archived — no further activation work",
      },
    ];

    const queue: VolunteerIntakeQueueRow[] = intakes.map((row) => {
      const meta = isRecord(row.metadata) ? row.metadata : {};
      const structured = row.submission?.structuredData;
      const user = row.submission?.user;

      return {
        id: row.id,
        status: row.status,
        pipelineStage: pipelineStage(row.status),
        title: row.title,
        source: row.source,
        createdAt: row.createdAt.toISOString(),
        county: metaString(meta, "county"),
        city: metaString(meta, "city"),
        zip: metaString(meta, "zip"),
        preferredRole: metaString(meta, "preferredRole"),
        preferredLanguage: metaString(meta, "preferredLanguage"),
        leadershipInterest: metaBool(meta, "leadershipInterest"),
        student: metaBool(meta, "student"),
        schoolCampus: metaString(meta, "schoolCampus"),
        interests: metaStringArray(meta, "interests"),
        hostingInterest: metaBool(meta, "hostingInterest"),
        fundraisingInterest: metaBool(meta, "fundraisingInterest"),
        userId: user?.id ?? null,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        hasVolunteerProfile: Boolean(user?.volunteerProfile),
        volunteerTeamSlug: teamSlugFromSubmission(structured),
        submissionId: row.submission?.id ?? null,
        detailHref: `/election-plan/operators/volunteer-intake?intake=${row.id}`,
      };
    });

    return { dbAvailable: true, stats, pipeline, queue };
  } catch (e) {
    console.error("[loadVolunteerIntakeDashboard]", e);
    return EMPTY;
  }
}

export function isVolunteerIntakeSource(source: string | null | undefined): boolean {
  if (!source) return false;
  return (VOLUNTEER_INTAKE_SOURCES as readonly string[]).includes(source);
}
