/**
 * Zod contracts for Author Studio POST bodies and structured `data` payloads.
 * `produces` is always a known artifact kind; `data` is never a free-form blob.
 *
 * Persistence (priority routes that touch the database):
 * - Use `mode: "preview"` to return the same `produces` + `data` without Prisma writes; `mode: "apply"` (default) runs persistence.
 * - `context` + `input` (see `authorStudioRequestBody.ts`) are merged to legacy flat fields before validation; TODO: migrate remaining 8 routes to the same shell.
 * - `SocialContentItem.bodyCopy` — `compose/*` (via `persistenceIntent` + legacy `mode` / `applyToWorkItem`) and platform-pack `applyMasterToWorkItem` (when `mode === "apply"`).
 * - `SocialContentDraft` — `compose/*` with `persistenceIntent: "save_draft"` (optional `draftTitle`); structured `persistence` echo on `draft_set` `data` when not preview.
 * - `SocialPlatformVariant` — `transform/platform-pack` with `persistVariants` when `mode === "apply"`.
 * - `CampaignTask` — `package/create-tasks` when `mode === "apply"`.
 */

import { z } from "zod";
import { CampaignTaskPriority, CampaignTaskType } from "@prisma/client";
import { mergeAuthorStudioV2WithLegacy } from "./authorStudioRequestBody";
import { authorStudioOutputKinds, type AuthorStudioStructuredOutputKind } from "./types";

// ---------------------------------------------------------------------------
// Request envelopes (context IDs threaded from workbench)
// ---------------------------------------------------------------------------

export const authorStudioContextIdsSchema = z.object({
  socialContentItemId: z.string().min(1).optional(),
  workflowIntakeId: z.string().min(1).optional(),
  campaignEventId: z.string().min(1).optional(),
});

export const authorStudioRequestEnvelopeSchema = authorStudioContextIdsSchema.extend({
  actionLabel: z.string().optional(),
  stateSnapshot: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Per-route request bodies
// ---------------------------------------------------------------------------

const composePersistenceIntentSchema = z.enum([
  "preview",
  "apply_to_master",
  "replace_master",
  "save_draft",
]);

const composeDraftRequestBaseSchema = authorStudioRequestEnvelopeSchema.extend({
  mode: z.enum(["preview", "apply"]).default("apply"),
  /** When set, drives DB writes; legacy `mode` + `applyToWorkItem` are still honored via server resolution. */
  persistenceIntent: composePersistenceIntentSchema.optional(),
  /** Optional label when `persistenceIntent` is `save_draft`. */
  draftTitle: z.string().max(240).optional(),
  /** Matches UI and server heuristics (`style_transform`, `persist_brief`, `from_brief`, etc.). */
  intent: z.string().min(1).default("from_brief"),
  /** When `mode` is `apply` and this is not false, persist `data.compose.master` to `bodyCopy` when a work item is set. */
  applyToWorkItem: z.boolean().optional(),
  target: z.string().optional(),
  brief: z
    .object({
      title: z.string().optional(),
      campaignGoal: z.string().optional(),
      messageType: z.string().optional(),
      audience: z.string().optional(),
      tone: z.string().optional(),
      voiceMode: z.string().optional(),
      countyOrRegion: z.string().optional(),
      cta: z.string().optional(),
    })
    .partial()
    .optional(),
  compose: z
    .object({
      master: z.string().optional(),
    })
    .optional(),
  /**
   * When set with `context.socialContentItemId`, the server loads this `SocialContentDraft` and uses
   * its `bodyCopy` as the effective master for preview + write-back (compose/draft).
   */
  selectedContentDraftId: z.string().min(1).optional(),
});

export const composeDraftRequestSchema = z.preprocess(mergeAuthorStudioV2WithLegacy, composeDraftRequestBaseSchema);
export type ComposeDraftRequest = z.infer<typeof composeDraftRequestBaseSchema>;

const composeRewriteRequestBaseSchema = authorStudioRequestEnvelopeSchema.extend({
  mode: z.enum(["preview", "apply"]).default("apply"),
  persistenceIntent: composePersistenceIntentSchema.optional(),
  draftTitle: z.string().max(240).optional(),
  intent: z.enum(["tighten", "shorten", "clarify"]).default("tighten"),
  sourceText: z.string().optional(),
  maxChars: z.number().int().positive().max(20000).optional(),
  length: z.enum(["tight", "standard", "long"]).optional(),
  applyToWorkItem: z.boolean().optional(),
  /** When set, use this draft’s `bodyCopy` as `sourceText` for the rewrite (must belong to the same work item). */
  selectedContentDraftId: z.string().min(1).optional(),
});

export const composeRewriteRequestSchema = z.preprocess(mergeAuthorStudioV2WithLegacy, composeRewriteRequestBaseSchema);
export type ComposeRewriteRequest = z.infer<typeof composeRewriteRequestBaseSchema>;

const platformPackRequestBaseSchema = authorStudioRequestEnvelopeSchema
  .extend({
    mode: z.enum(["preview", "apply"]).default("apply"),
    master: z.string().min(1).optional(),
    persistVariants: z.boolean().optional(),
    applyMasterToWorkItem: z.boolean().optional(),
    /**
     * When `true` with persist: only `create` new platform rows; skip updating existing variant copy.
     * When `false` / omitted: upsert (replace copy on existing) — the default “replace variant copy” behavior.
     */
    onlyCreateMissingVariants: z.boolean().optional(),
    platforms: z
      .array(
        z.enum([
          "FACEBOOK",
          "INSTAGRAM",
          "X",
          "TIKTOK",
          "YOUTUBE",
          "THREADS",
          "BLUESKY",
          "OTHER",
        ] as const)
      )
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.master?.trim() && !v.socialContentItemId) {
      ctx.addIssue({ code: "custom", message: "Provide `master` text and/or `socialContentItemId` to load from the work item." });
    }
    if (v.persistVariants === true && !v.socialContentItemId) {
      ctx.addIssue({ code: "custom", path: ["persistVariants"], message: "persistVariants requires `socialContentItemId`" });
    }
  });

export const platformPackRequestSchema = z.preprocess(mergeAuthorStudioV2WithLegacy, platformPackRequestBaseSchema);
export type PlatformPackRequest = z.infer<typeof platformPackRequestBaseSchema>;

const createTasksRequestBaseSchema = authorStudioRequestEnvelopeSchema
  .extend({
    mode: z.enum(["preview", "apply"]).default("apply"),
    socialContentItemId: z.string().min(1),
    /** Linked `OwnedMediaAsset` when task pack is media/transcript-scoped. */
    ownedMediaId: z.string().min(1).optional(),
    socialContentMediaRefId: z.string().min(1).optional(),
    pack: z
      .enum(["comms_review", "schedule_publish", "media_production", "monitor_engagement"])
      .optional(),
    tasks: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          taskType: z.nativeEnum(CampaignTaskType),
          priority: z.nativeEnum(CampaignTaskPriority).optional(),
        })
      )
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.pack == null && (v.tasks == null || v.tasks.length === 0)) {
      ctx.addIssue({ code: "custom", message: "Provide `pack` or a non-empty `tasks` array." });
    }
  });

export const createTasksRequestSchema = z.preprocess(mergeAuthorStudioV2WithLegacy, createTasksRequestBaseSchema);
export type CreateTasksRequest = z.infer<typeof createTasksRequestBaseSchema>;

// ---------------------------------------------------------------------------
// Shared pieces for `data` payloads
// ---------------------------------------------------------------------------

export const persistenceIdsDataSchema = z.object({
  socialContentItemId: z.string().optional(),
  workflowIntakeId: z.string().optional(),
  campaignEventId: z.string().optional(),
  /** When a stub/tool run is scoped to a specific `OwnedMediaAsset` (workbench link). */
  linkedOwnedMediaId: z.string().optional(),
});

const draftVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

const composeStateResponseSchema = z.object({
  master: z.string(),
  alternates: z.array(draftVersionSchema),
  compareLeftId: z.string().nullable().optional(),
  compareRightId: z.string().nullable().optional(),
  compareMode: z.boolean().optional(),
  length: z.enum(["tight", "standard", "long"]).optional(),
});

const draftSetPersistenceSchema = z.object({
  workbenchRefetch: z.boolean().optional(),
  didSaveDraft: z.boolean().optional(),
  savedDraftId: z.string().optional(),
  didApplyToMaster: z.boolean().optional(),
  /** Row created for the latest apply/replace (isApplied: true on server). */
  appliedDraftId: z.string().optional(),
  appliedIntent: z.string().optional(),
});

export const draftSetDataSchema = persistenceIdsDataSchema.extend({
  intent: z.string().optional(),
  compose: composeStateResponseSchema,
  /** Echo of compose/rewrite write-back; omitted on pure preview. */
  persistence: draftSetPersistenceSchema.optional(),
});
export type DraftSetData = z.infer<typeof draftSetDataSchema>;

export const platformPackItemSchema = z.object({
  id: z.string(),
  platform: z.string(),
  targetAccount: z.string(),
  objective: z.string(),
  scheduleAt: z.string(),
  copy: z.string(),
  cta: z.string(),
  hashtags: z.string(),
  notes: z.string(),
  assetNote: z.string(),
  readiness: z.enum(["draft", "ready", "blocked", "scheduled"]),
  /** Set when the row maps 1:1 to `SocialPlatform` */
  socialPlatform: z
    .enum([
      "FACEBOOK",
      "INSTAGRAM",
      "X",
      "TIKTOK",
      "YOUTUBE",
      "THREADS",
      "BLUESKY",
      "OTHER",
    ] as const)
    .optional(),
});
export const platformPackDataSchema = persistenceIdsDataSchema.extend({
  platformPack: z.array(platformPackItemSchema),
  /** Ids of upserted `SocialPlatformVariant` when `persistVariants` ran */
  platformVariantIds: z.array(z.string()).optional(),
});
export type PlatformPackData = z.infer<typeof platformPackDataSchema>;

const taskRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  taskType: z.string(),
  priority: z.string(),
});
export const taskPackageDataSchema = persistenceIdsDataSchema.extend({
  createdTaskIds: z.array(z.string()),
  tasks: z.array(taskRowSchema),
  approval: z.object({
    linkedTasks: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["task", "asset", "event", "intake"]),
      })
    ),
  }),
});
export type TaskPackageData = z.infer<typeof taskPackageDataSchema>;

export const savedBriefDataSchema = persistenceIdsDataSchema.extend({
  brief: z
    .object({
      title: z.string().optional(),
      campaignGoal: z.string().optional(),
    })
    .passthrough()
    .optional(),
});
export const researchMemoDataSchema = persistenceIdsDataSchema.extend({
  research: z
    .object({
      researchMemo: z.string().optional(),
      summaryMemo: z.string().optional(),
      rebuttalContext: z.string().optional(),
    })
    .passthrough()
    .optional(),
});
export const videoRepurposeDataSchema = persistenceIdsDataSchema.extend({
  video: z
    .object({
      clipSuggestions: z.array(z.string()).optional(),
      hooks: z.string().optional(),
      cutPlan: z.string().optional(),
      editInstructionMemo: z.string().optional(),
    })
    .passthrough()
    .optional(),
});
export const videoCutPlanDataSchema = persistenceIdsDataSchema.extend({
  video: z.object({
    cutPlan: z.string(),
    clipSuggestions: z.array(z.string()).optional(),
  }),
});
export const captionPackageDataSchema = persistenceIdsDataSchema.extend({
  video: z.object({
    subtitles: z.string(),
  }),
});
export const visualRequestDataSchema = persistenceIdsDataSchema.extend({
  visual: z
    .object({
      imagePrompt: z.string().optional(),
    })
    .passthrough()
    .optional(),
});
export const visualPromptSetDataSchema = persistenceIdsDataSchema.extend({
  visual: z.object({
    promptVersions: z.array(z.object({ id: z.string(), label: z.string(), prompt: z.string() })),
  }),
});
export const exportPackageDataSchema = persistenceIdsDataSchema.extend({
  approval: z
    .object({
      exportNotes: z.string().optional(),
      checklist: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            done: z.boolean(),
          })
        )
        .optional(),
    })
    .passthrough(),
});
export type ExportPackageData = z.infer<typeof exportPackageDataSchema>;

// ---------------------------------------------------------------------------
// Response: validate full AuthorStudioPostResponse.data against `produces`
// ---------------------------------------------------------------------------

const produceToDataSchema: Record<AuthorStudioStructuredOutputKind, z.ZodType<unknown>> = {
  [authorStudioOutputKinds.savedBrief]: savedBriefDataSchema,
  [authorStudioOutputKinds.researchMemo]: researchMemoDataSchema,
  [authorStudioOutputKinds.draftSet]: draftSetDataSchema,
  [authorStudioOutputKinds.platformPack]: platformPackDataSchema,
  [authorStudioOutputKinds.taskPackage]: taskPackageDataSchema,
  [authorStudioOutputKinds.visualRequest]: visualRequestDataSchema,
  [authorStudioOutputKinds.visualPromptSet]: visualPromptSetDataSchema,
  [authorStudioOutputKinds.videoRepurposePlan]: videoRepurposeDataSchema,
  [authorStudioOutputKinds.videoCutPlan]: videoCutPlanDataSchema,
  [authorStudioOutputKinds.captionPackage]: captionPackageDataSchema,
  [authorStudioOutputKinds.exportPackage]: exportPackageDataSchema,
} as const;

export const authorStudioOutputKindZod = z.enum([
  authorStudioOutputKinds.savedBrief,
  authorStudioOutputKinds.researchMemo,
  authorStudioOutputKinds.draftSet,
  authorStudioOutputKinds.platformPack,
  authorStudioOutputKinds.taskPackage,
  authorStudioOutputKinds.visualRequest,
  authorStudioOutputKinds.visualPromptSet,
  authorStudioOutputKinds.videoRepurposePlan,
  authorStudioOutputKinds.videoCutPlan,
  authorStudioOutputKinds.captionPackage,
  authorStudioOutputKinds.exportPackage,
]);

export function parseAuthorStudioData(
  produces: AuthorStudioStructuredOutputKind | null,
  data: unknown
):
  | { success: true; data: unknown }
  | { success: false; error: z.ZodError } {
  if (produces == null) {
    if (data === null) return { success: true, data: null };
    return { success: false, error: new z.ZodError([{ code: "custom", path: ["data"], message: "expected null when produces is null" }]) };
  }
  const s = produceToDataSchema[produces];
  if (!s) {
    return { success: false, error: new z.ZodError([{ code: "custom", path: ["produces"], message: "unknown produces" }]) };
  }
  const r = s.safeParse(data);
  if (!r.success) return { success: false, error: r.error };
  return { success: true, data: r.data };
}
