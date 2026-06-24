import { CampaignTaskStatus, RelationalOrganizingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { loadLeaderContactSpineSummary } from "@/lib/volunteers/contact-spine";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { loadVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster-db";
import { loadVolunteerIntakeDashboard } from "@/lib/volunteers/load-volunteer-intake-dashboard";

import { loadOpsMyWork, type OpsMyWorkPayload, type OpsWorkItemRow } from "./load-my-work";

export type RoleInboxPayload = OpsMyWorkPayload & {
  sections?: Array<{ id: string; label: string; items: OpsWorkItemRow[] }>;
};

function syntheticRow(input: Omit<OpsWorkItemRow, "id" | "href"> & { id: string; href: string }): OpsWorkItemRow {
  return { ...input, href: input.href };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function loadCmRoleInbox(limit = 50): Promise<RoleInboxPayload> {
  const empty: RoleInboxPayload = { dbAvailable: false, items: [], sections: [] };
  if (!isDatabaseConfigured()) return empty;

  try {
    const now = new Date();
    const [adminTasks, operatorTasks, blocked, overdue, intake] = await Promise.all([
      loadOpsMyWork({ visibility: ["admin"], limit: Math.ceil(limit / 2) }),
      loadOpsMyWork({ visibility: ["operators"], limit: Math.ceil(limit / 2) }),
      prisma.campaignTask.findMany({
        where: { status: CampaignTaskStatus.BLOCKED },
        orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          assignedRole: true,
          dueAt: true,
          leaderSlug: true,
          opsVisibility: true,
          opsSourceSignalId: true,
        },
      }),
      prisma.campaignTask.findMany({
        where: {
          status: { in: ["TODO", "IN_PROGRESS"] },
          dueAt: { lt: now },
        },
        orderBy: [{ dueAt: "asc" }],
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          assignedRole: true,
          dueAt: true,
          leaderSlug: true,
          opsVisibility: true,
          opsSourceSignalId: true,
        },
      }),
      loadVolunteerIntakeDashboard(),
    ]);

    const taskIds = new Set<string>();
    const taskItems: OpsWorkItemRow[] = [];

    for (const row of [...adminTasks.items, ...operatorTasks.items]) {
      if (taskIds.has(row.id)) continue;
      taskIds.add(row.id);
      taskItems.push(row);
    }

    for (const r of [...blocked, ...overdue]) {
      if (taskIds.has(r.id)) continue;
      taskIds.add(r.id);
      taskItems.push({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        priority: r.priority,
        assignedRole: r.assignedRole,
        dueAt: r.dueAt?.toISOString() ?? null,
        leaderSlug: r.leaderSlug,
        opsVisibility: r.opsVisibility,
        signalId: r.opsSourceSignalId,
        itemKind: r.status === CampaignTaskStatus.BLOCKED ? "blocked_task" : "overdue_task",
        completable: true,
        href: r.opsVisibility === "admin" ? "/admin/tasks" : "/admin/my-work",
      });
    }

    const intakeCount = intake.stats.pending + intake.stats.inReview;
    const synthetic: OpsWorkItemRow[] = [];
    if (intakeCount > 0) {
      synthetic.push(
        syntheticRow({
          id: "cm-intake-queue",
          title: `Volunteer intake queue (${intakeCount} awaiting review)`,
          description: "Website sign-ups in pending or in-review — operators hub volunteer intake dashboard.",
          status: CampaignTaskStatus.TODO,
          priority: intakeCount >= 15 ? "URGENT" : intakeCount >= 5 ? "HIGH" : "MEDIUM",
          assignedRole: "CAMPAIGN_MANAGER",
          dueAt: null,
          leaderSlug: null,
          opsVisibility: "admin",
          signalId: "cm-intake-backlog",
          itemKind: "intake_escalation",
          completable: false,
          href: "/election-plan/operators/volunteer-intake",
        }),
      );
    }

    const sections = [
      { id: "escalations", label: "Escalations", items: synthetic },
      { id: "tasks", label: "Open ops tasks", items: taskItems },
    ];

    const items = [...synthetic, ...taskItems].slice(0, limit);

    return {
      dbAvailable: true,
      items,
      sections,
    };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}

export async function loadLeaderRoleInbox(leaderSlug: string, limit = 30): Promise<RoleInboxPayload> {
  const empty: RoleInboxPayload = { dbAvailable: false, items: [], sections: [] };
  if (!isDatabaseConfigured()) return empty;

  const leader = getVolunteerLeaderBySlug(leaderSlug);
  if (!leader) return { ...empty, dbAvailable: true };

  try {
    const today = startOfToday();

    const [taskPayload, contactSpine, roster] = await Promise.all([
      loadOpsMyWork({ leaderSlug, visibility: ["leader", "operators", "admin"], limit: 20 }),
      loadLeaderContactSpineSummary(leaderSlug),
      loadVolunteerLeaderRoster(leader.initials, leader.slug),
    ]);

    const followUps: OpsWorkItemRow[] = [];

    if (contactSpine.ownerUserId) {
      const dueContacts = await prisma.relationalContact.findMany({
        where: {
          ownerUserId: contactSpine.ownerUserId,
          OR: [
            { nextFollowUpAt: { lte: today } },
            {
              nextFollowUpAt: null,
              organizingStatus: {
                in: [
                  RelationalOrganizingStatus.CONTACTED,
                  RelationalOrganizingStatus.ENGAGED,
                  RelationalOrganizingStatus.FOLLOW_UP_NEEDED,
                ],
              },
            },
          ],
        },
        orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
        take: 8,
        select: {
          id: true,
          displayName: true,
          nextFollowUpAt: true,
          organizingStatus: true,
        },
      });

      for (const c of dueContacts) {
        followUps.push(
          syntheticRow({
            id: `follow-up:${c.id}`,
            title: `Follow up — ${c.displayName}`,
            description: `CRM contact · status ${c.organizingStatus.replace(/_/g, " ")}`,
            status: CampaignTaskStatus.TODO,
            priority: c.nextFollowUpAt && c.nextFollowUpAt <= today ? "HIGH" : "MEDIUM",
            assignedRole: null,
            dueAt: c.nextFollowUpAt?.toISOString() ?? null,
            leaderSlug,
            opsVisibility: "leader",
            signalId: null,
            itemKind: "follow_up",
            completable: false,
            href: `/admin/relational-contacts/${c.id}`,
          }),
        );
      }
    }

    const po5Gaps: OpsWorkItemRow[] = [];
    for (const person of roster.myFive) {
      if (person.displayName === "Open slot" || person.status === "open") {
        po5Gaps.push(
          syntheticRow({
            id: `po5-slot:${person.id}`,
            title: `Fill My Five slot ${person.slotIndex ?? "?"}`,
            description: "Open slot on your Power of 5 roster — map a trusted contact.",
            status: CampaignTaskStatus.TODO,
            priority: "MEDIUM",
            assignedRole: null,
            dueAt: null,
            leaderSlug,
            opsVisibility: "leader",
            signalId: null,
            itemKind: "po5_gap",
            completable: false,
            href: "#my-five",
          }),
        );
      } else if (person.status !== "committed") {
        followUps.push(
          syntheticRow({
            id: `roster-follow-up:${person.id}`,
            title: `Touch ${person.displayName} (My Five)`,
            description: person.lastTouchNote?.trim() || "Move toward commitment on your roster.",
            status: CampaignTaskStatus.TODO,
            priority: "MEDIUM",
            assignedRole: null,
            dueAt: null,
            leaderSlug,
            opsVisibility: "leader",
            signalId: null,
            itemKind: "follow_up",
            completable: false,
            href: "#my-five",
          }),
        );
      }
    }

    const sections = [
      { id: "assigned", label: "Assigned tasks", items: taskPayload.items },
      { id: "follow-ups", label: "Follow-ups", items: followUps },
      { id: "po5", label: "My Five gaps", items: po5Gaps },
    ];

    const items = [...taskPayload.items, ...followUps, ...po5Gaps].slice(0, limit);

    return {
      dbAvailable: true,
      items,
      sections,
    };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}
