import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  SocialPlatform,
  SocialVariantStatus,
} from "@prisma/client";
import type { SocialContentItem } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminActorUserId } from "@/lib/admin/actor";
import type { DraftSetData, PlatformPackData, TaskPackageData } from "./outputSchemas";

// Same task definitions as workbench `TASK_PACKS` (keep in sync for operational parity)
const PACK_DEFS: Record<
  "comms_review" | "schedule_publish" | "media_production" | "monitor_engagement",
  { title: string; taskType: CampaignTaskType; priority: CampaignTaskPriority; description: string }[]
> = {
  comms_review: [
    {
      title: "Review & approve social copy",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.HIGH,
      description: "Comms: proofread, tone, and approval for this work item.",
    },
    {
      title: "Align messaging with event / intake",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Check consistency with source brief (event or intake) when set.",
    },
  ],
  schedule_publish: [
    {
      title: "Set publish and boost window",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.HIGH,
      description: "Confirm schedule and accounts for each variant.",
    },
  ],
  media_production: [
    {
      title: "Media: cut / image / B-roll for variants",
      taskType: CampaignTaskType.MEDIA,
      priority: CampaignTaskPriority.HIGH,
      description: "Produce assets referenced by the work item and variants — TODO: attach `ownedMedia` ids later.",
    },
  ],
  monitor_engagement: [
    {
      title: "Engagement monitor: 24h after publish",
      taskType: CampaignTaskType.FOLLOW_UP,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Watch comments, DMs, and replies — response scripts via Author Studio (TODO: pipeline).",
    },
  ],
};

const DEFAULT_PLATFORMS: SocialPlatform[] = [
  SocialPlatform.FACEBOOK,
  SocialPlatform.INSTAGRAM,
  SocialPlatform.X,
  SocialPlatform.TIKTOK,
  SocialPlatform.YOUTUBE,
];

function platformLabel(p: SocialPlatform) {
  return p === SocialPlatform.FACEBOOK
    ? "facebook"
    : p === SocialPlatform.INSTAGRAM
      ? "instagram"
      : p === SocialPlatform.X
        ? "x_thread"
        : p === SocialPlatform.TIKTOK
          ? "tiktok"
          : p === SocialPlatform.YOUTUBE
            ? "yt_shorts"
            : String(p);
}

export function buildDraftSetFromItemAndBrief(
  item: SocialContentItem | null,
  input: { intent: string; brief?: Record<string, unknown> | null; compose?: { master?: string } | null }
): DraftSetData {
  const now = new Date().toISOString();
  const b = input.brief ?? {};
  const title = (typeof b.title === "string" && b.title) || item?.title || "Message";
  const goal = typeof b.campaignGoal === "string" ? b.campaignGoal : "Advance trust and participation.";
  const audience = typeof b.audience === "string" ? b.audience : "Arkansas voters and neighbors who care about local quality of life";
  const tone = typeof b.tone === "string" ? b.tone : "Clear, non-negative, grounded";
  const cta = typeof b.cta === "string" ? b.cta : "Get involved in your county";

  let master =
    input.compose?.master?.trim() ||
    item?.bodyCopy?.trim() ||
    [
      `Headline: ${title}`,
      ``,
      `${goal}. We're speaking with ${audience} in a ${tone} voice.`,
      ``,
      `Today: name the stakes, offer a path forward, and end with: ${cta}.`,
      ``,
      `— This draft is a starting point: tighten facts, add local color, and route through comms + legal before publish.`,
    ].join("\n");

  if (input.intent === "blank" && !input.compose?.master?.trim() && !item?.bodyCopy) {
    master = "Draft placeholder — set brief fields or work item copy, then run again.";
  }

  const alternates: { id: string; label: string; body: string; createdAt: string }[] = [
    {
      id: `alt-${randomUUID()}`,
      label: "A · direct",
      body: master.split("\n\n").slice(0, 3).join("\n\n") + (master.length > 400 ? "\n\n…" : ""),
      createdAt: now,
    },
    {
      id: `alt-${randomUUID()}`,
      label: "B · soft lead",
      body: `Quick thought for neighbors reading this in passing: ${String(title).toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} matters because it affects our families. ${goal} ${cta}.`,
      createdAt: now,
    },
  ];

  return {
    socialContentItemId: item?.id,
    workflowIntakeId: item?.workflowIntakeId ?? undefined,
    campaignEventId: item?.campaignEventId ?? undefined,
    intent: input.intent,
    compose: {
      master,
      alternates,
      compareLeftId: alternates[0]?.id ?? null,
      compareRightId: alternates[1]?.id ?? null,
      compareMode: false,
      length: "standard" as const,
    },
  };
}

export function rewriteComposeText(
  source: string,
  intent: "tighten" | "shorten" | "clarify",
  maxChars?: number
): { master: string } {
  let out = source.replace(/\s+/g, " ").trim();
  if (intent === "tighten") {
    out = out.replace(/\b(very|just|basically|really|actually)\b/gi, "").replace(/\s+/g, " ").trim();
  }
  if (intent === "clarify") {
    if (!/^[0-9]/.test(out) && out.length < 2000) {
      out = `What to know: ${out}`;
    }
  }
  if (intent === "shorten" || (maxChars && out.length > maxChars)) {
    const cap = maxChars && maxChars < out.length ? maxChars : Math.min(280, out.length);
    const slice = out.slice(0, cap);
    out = (slice.lastIndexOf(".") > 40 ? slice.slice(0, slice.lastIndexOf(".") + 1) : slice).trim() + (out.length > cap ? "…" : "");
  }
  return { master: out };
}

type PackItem = PlatformPackData["platformPack"][number];

export function buildPlatformPackStructured(
  master: string,
  platforms: SocialPlatform[] | undefined
): { platformPack: PackItem[]; forPersist: { platform: SocialPlatform; copy: string }[] } {
  const use = platforms != null && platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;
  const platformPack: PackItem[] = [];
  const forPersist: { platform: SocialPlatform; copy: string }[] = [];

  for (const p of use) {
    const label = platformLabel(p);
    const isShort = p === SocialPlatform.X || p === SocialPlatform.TIKTOK;
    const copy = isShort
      ? master.slice(0, 220).replace(/\n+/g, " ").trim() + (master.length > 220 ? "…" : "")
      : [master, "", "#TrustFirst #Local"].join("\n");
    const row: PackItem = {
      id: `pp-${p}-${randomUUID()}`,
      platform: label,
      targetAccount: "primary @account (TODO bind)",
      objective: p === SocialPlatform.INSTAGRAM || p === SocialPlatform.TIKTOK ? "Engagement + follow" : "Reach + event/conversion",
      scheduleAt: "",
      copy,
      cta: "Link in bio / RSVP from events tab",
      hashtags: p === SocialPlatform.INSTAGRAM || p === SocialPlatform.TIKTOK ? "Local · Arkansas · community" : "",
      notes: "Generated structure — swap handle, time window, and legal disclaimers in comms pass.",
      assetNote: "Attach or reference OwnedMedia in workbench / library.",
      readiness: "draft",
      socialPlatform: p,
    };
    platformPack.push(row);
    forPersist.push({ platform: p, copy: row.copy });
  }

  return { platformPack, forPersist };
}

/** Writes the studio “master” string to the work item’s `bodyCopy` and revalidates workbench pages. */
export async function persistWorkItemBodyCopy(socialContentItemId: string, bodyCopy: string): Promise<void> {
  const text = bodyCopy.trim();
  await prisma.socialContentItem.update({
    where: { id: socialContentItemId },
    data: { bodyCopy: text.length ? text : null },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
}

export async function persistPlatformVariants(
  socialContentItemId: string,
  forPersist: { platform: SocialPlatform; copy: string }[],
  options?: { onlyCreateMissing?: boolean }
): Promise<string[]> {
  const ids: string[] = [];
  for (const row of forPersist) {
    const existing = await prisma.socialPlatformVariant.findFirst({
      where: { socialContentItemId, platform: row.platform },
    });
    if (existing) {
      if (options?.onlyCreateMissing) {
        continue;
      }
      const u = await prisma.socialPlatformVariant.update({
        where: { id: existing.id },
        data: { copyText: row.copy, status: SocialVariantStatus.DRAFT },
      });
      ids.push(u.id);
    } else {
      const c = await prisma.socialPlatformVariant.create({
        data: {
          socialContentItemId,
          platform: row.platform,
          copyText: row.copy,
          status: SocialVariantStatus.DRAFT,
        },
      });
      ids.push(c.id);
    }
  }
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return ids;
}

/** Same task rows as `createAuthorStudioTaskPackage` but no DB writes — `createdTaskIds` is empty, task ids are preview-only. TODO: share row builder with create when packs grow. */
export async function previewAuthorStudioTaskPackage(
  input: { socialContentItemId: string; pack?: keyof typeof PACK_DEFS; tasks?: { title: string; description?: string; taskType: CampaignTaskType; priority?: CampaignTaskPriority }[] }
): Promise<TaskPackageData> {
  const parent = await prisma.socialContentItem.findUnique({
    where: { id: input.socialContentItemId },
    select: { id: true, campaignEventId: true, workflowIntakeId: true },
  });
  if (!parent) {
    throw new Error("Work item not found");
  }
  const rows: { title: string; description: string; taskType: CampaignTaskType; priority: CampaignTaskPriority }[] = input.pack
    ? PACK_DEFS[input.pack].map((t) => ({ ...t }))
    : (input.tasks ?? []).map((t) => ({
        title: t.title,
        description: t.description ?? "",
        taskType: t.taskType,
        priority: t.priority ?? CampaignTaskPriority.MEDIUM,
      }));
  if (rows.length === 0) {
    throw new Error("No tasks to create");
  }
  const withIds = rows.map((r) => ({ r, id: `preview-${randomUUID()}` }));
  return {
    socialContentItemId: parent.id,
    workflowIntakeId: parent.workflowIntakeId ?? undefined,
    campaignEventId: parent.campaignEventId ?? undefined,
    createdTaskIds: [],
    tasks: withIds.map(({ r, id }) => ({
      id,
      title: r.title,
      status: CampaignTaskStatus.TODO,
      taskType: r.taskType,
      priority: r.priority,
    })),
    approval: {
      linkedTasks: withIds.map(({ r, id }) => ({ id, label: r.title, type: "task" as const })),
    },
  };
}

export async function createAuthorStudioTaskPackage(
  input: { socialContentItemId: string; pack?: keyof typeof PACK_DEFS; tasks?: { title: string; description?: string; taskType: CampaignTaskType; priority?: CampaignTaskPriority }[] }
): Promise<TaskPackageData> {
  const parent = await prisma.socialContentItem.findUnique({
    where: { id: input.socialContentItemId },
    select: { id: true, campaignEventId: true, workflowIntakeId: true },
  });
  if (!parent) {
    throw new Error("Work item not found");
  }
  const actor = await getAdminActorUserId();
  const rows: { title: string; description: string; taskType: CampaignTaskType; priority: CampaignTaskPriority }[] = input.pack
    ? PACK_DEFS[input.pack].map((t) => ({ ...t }))
    : (input.tasks ?? []).map((t) => ({
        title: t.title,
        description: t.description ?? "",
        taskType: t.taskType,
        priority: t.priority ?? CampaignTaskPriority.MEDIUM,
      }));
  if (rows.length === 0) {
    throw new Error("No tasks to create");
  }

  const created = await prisma.$transaction(
    rows.map((t) =>
      prisma.campaignTask.create({
        data: {
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          priority: t.priority,
          status: CampaignTaskStatus.TODO,
          socialContentItemId: parent.id,
          eventId: parent.campaignEventId,
          createdByUserId: actor,
        },
        select: { id: true, title: true, status: true, taskType: true, priority: true },
      })
    )
  );

  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  revalidatePath("/admin/tasks");

  return {
    socialContentItemId: parent.id,
    workflowIntakeId: parent.workflowIntakeId ?? undefined,
    campaignEventId: parent.campaignEventId ?? undefined,
    createdTaskIds: created.map((c) => c.id),
    tasks: created.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      taskType: c.taskType,
      priority: c.priority,
    })),
    approval: {
      linkedTasks: created.map((c) => ({ id: c.id, label: c.title, type: "task" as const })),
    },
  };
}

/** Inserts a structured alternate compose result for a work item (Author Studio; not free-form JSON blobs on the item). */
export async function saveSocialContentDraft(input: {
  socialContentItemId: string;
  bodyCopy: string;
  title?: string | null;
  sourceRoute?: string | null;
  sourceIntent?: string | null;
  createdByUserId?: string | null;
  isApplied?: boolean;
}): Promise<{ id: string }> {
  const text = input.bodyCopy.trim();
  if (!text) {
    throw new Error("bodyCopy is required to save a draft");
  }
  const actor = await getAdminActorUserId();
  const row = await prisma.socialContentDraft.create({
    data: {
      socialContentItemId: input.socialContentItemId,
      bodyCopy: text,
      title: input.title?.trim() ? input.title.trim() : null,
      sourceRoute: input.sourceRoute?.trim() || null,
      sourceIntent: input.sourceIntent?.trim() || null,
      createdByUserId: input.createdByUserId ?? actor,
      isApplied: input.isApplied ?? false,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { id: row.id };
}
