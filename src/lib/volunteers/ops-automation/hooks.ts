import type { ElectionPlanFieldCategory } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { applyEventWorkflowTemplate } from "@/lib/calendar/event-task-engine";
import { getVolunteerLeaderByInitials, getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { readIntakePlacementMetadata } from "@/lib/volunteers/contact-spine/metadata";
import type { VolunteerLifecycleStage } from "@/lib/volunteers/volunteer-lifecycle";

import { createAutomationTask } from "./create-automation-task";
import { FIELD_FOLLOW_UP_CATEGORIES } from "./definitions";

function followUpDueDays(category: ElectionPlanFieldCategory): number {
  if (category === "conversation") return 3;
  if (category === "volunteer") return 5;
  return 7;
}

/** Field log saved → schedule leader follow-up (contact spine already synced). */
export async function onFieldLogSynced(input: {
  fieldEntryId: string;
  operatorInitials: string;
  category: ElectionPlanFieldCategory;
  label: string;
  description: string | null;
  countySlug: string;
  relationalContactId: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (!FIELD_FOLLOW_UP_CATEGORIES.has(input.category)) return;

  const leader = getVolunteerLeaderByInitials(input.operatorInitials);
  if (!leader) return;

  const contactNote = input.relationalContactId
    ? `CRM contact linked (${input.relationalContactId}).`
    : "Log follow-up in workbench field log after touch.";

  await createAutomationTask({
    trigger: "field_follow_up",
    signalKey: input.fieldEntryId,
    spec: {
      title: `Follow up: ${input.label}`,
      description: [
        input.description?.trim(),
        `County: ${input.countySlug}. ${contactNote}`,
        "Scheduled automatically from field log entry.",
      ]
        .filter(Boolean)
        .join("\n\n"),
      taskType: "FIELD",
      priority: input.category === "conversation" ? "HIGH" : "MEDIUM",
      assignedRole: "FIELD_DIRECTOR",
      opsSourceType: "field_signal",
      opsVisibility: "leader",
      dueDays: followUpDueDays(input.category),
      leaderSlug: leader.slug,
      metadata: {
        fieldEntryId: input.fieldEntryId,
        category: input.category,
        operatorInitials: input.operatorInitials,
        relationalContactId: input.relationalContactId,
      },
    },
  });
}

/** Intake lifecycle stage change → notify placement leader on onboarding. */
export async function onIntakeLifecycleStage(input: {
  intakeId: string;
  toStage: VolunteerLifecycleStage;
  volunteerName?: string | null;
  metadata: unknown;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (input.toStage !== "ONBOARDING") return;

  const placement = readIntakePlacementMetadata(input.metadata);
  const leaderSlug = placement.placementLeaderSlug?.trim();
  if (!leaderSlug) return;

  const leader = getVolunteerLeaderBySlug(leaderSlug);
  const nameSuffix = input.volunteerName?.trim() ? ` — ${input.volunteerName.trim()}` : "";

  await createAutomationTask({
    trigger: "intake_leader_notify",
    signalKey: input.intakeId,
    spec: {
      title: `Welcome new volunteer on your team${nameSuffix}`,
      description: [
        "A volunteer was placed on your roster from the statewide intake queue.",
        "Send a welcome, confirm workbench access, and assign first-week actions.",
        leader ? `Leader workbench: /election-plan/operators/leaders/${leader.slug}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
      taskType: "VOLUNTEER",
      priority: "HIGH",
      assignedRole: "VOLUNTEER_COORDINATOR",
      opsSourceType: "workflow_intake",
      opsVisibility: "leader",
      dueDays: 2,
      leaderSlug,
      metadata: {
        workflowIntakeId: input.intakeId,
        placementLeaderSlug: leaderSlug,
      },
    },
  });
}

/** Official calendar promotion → apply default event-type workflow task pack. */
export async function onEventOfficialPromoted(input: {
  recordId: string;
  calendarSourceId: string;
}): Promise<{ applied: boolean; eventId?: string; templateId?: string; reason?: string }> {
  if (!isDatabaseConfigured()) {
    return { applied: false, reason: "no_db" };
  }

  const promo = await prisma.kellyCalendarPromotion.findUnique({
    where: { calendarItemId: input.calendarSourceId },
    include: {
      campaignEvent: { select: { id: true, title: true, eventType: true } },
    },
  });

  const event =
    promo?.campaignEvent ??
    (await prisma.campaignEvent.findFirst({
      where: { calendarSourceId: input.calendarSourceId },
      select: { id: true, title: true, eventType: true },
    }));

  if (!event) {
    return { applied: false, reason: "no_campaign_event" };
  }

  const tpl = await prisma.workflowTemplate.findFirst({
    where: {
      isActive: true,
      campaignEventType: event.eventType,
      key: { startsWith: "s4_event_" },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, key: true },
  });

  if (!tpl) {
    return { applied: false, reason: "no_default_template", eventId: event.id };
  }

  const existingRun = await prisma.workflowRun.findUnique({
    where: {
      workflowTemplateId_triggerSourceType_triggerSourceId: {
        workflowTemplateId: tpl.id,
        triggerSourceType: "CAMPAIGN_EVENT",
        triggerSourceId: event.id,
      },
    },
    select: { id: true },
  });

  if (existingRun) {
    return { applied: false, reason: "already_applied", eventId: event.id, templateId: tpl.id };
  }

  try {
    await applyEventWorkflowTemplate(event.id, tpl.id, { actorUserId: null });
    return { applied: true, eventId: event.id, templateId: tpl.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { applied: false, reason: msg, eventId: event.id, templateId: tpl.id };
  }
}
