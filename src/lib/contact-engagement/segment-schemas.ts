import {
  CommsPlanAudienceSegmentMemberSource,
  CommsPlanAudienceSegmentStatus,
  CommsPlanAudienceSegmentType,
} from "@prisma/client";
import { z } from "zod";

const trimName = z.string().trim().min(1, "Name is required.").max(200);

const segmentTypeEnum = z.nativeEnum(CommsPlanAudienceSegmentType);
const statusEnum = z.nativeEnum(CommsPlanAudienceSegmentStatus);
const sourceEnum = z.nativeEnum(CommsPlanAudienceSegmentMemberSource);

/**
 * `segmentType` and `isDynamic` must align:
 * - Static manual: STATIC + isDynamic false
 * - Dynamic (rules, no manual membership in CE-4): DYNAMIC + isDynamic true
 * - System-like dynamic: SYSTEM + isDynamic true (operator-advanced, rare)
 * - `SYSTEM` + isDynamic false: reserved; treat as static-like for future system lists (optional)
 */
export const createCommsPlanAudienceSegmentInputSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    name: trimName,
    description: z.string().max(10_000).optional().nullable(),
    segmentType: segmentTypeEnum,
    isDynamic: z.boolean(),
    status: statusEnum.optional().default(CommsPlanAudienceSegmentStatus.ACTIVE),
    ruleDefinitionJson: z.unknown().optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.isDynamic) {
      if (d.segmentType === CommsPlanAudienceSegmentType.STATIC) {
        ctx.addIssue({ code: "custom", message: "Dynamic mode cannot use segment type STATIC.", path: ["segmentType"] });
      }
    } else {
      if (d.segmentType === CommsPlanAudienceSegmentType.DYNAMIC) {
        ctx.addIssue({ code: "custom", message: "Use static mode with segment type DYNAMIC, or mark the segment as dynamic.", path: ["isDynamic"] });
      }
    }
  });

export const updateCommsPlanAudienceSegmentInputSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    comsPlanAudienceSegmentId: z.string().min(1),
    name: trimName.optional(),
    description: z.string().max(10_000).optional().nullable(),
    status: statusEnum.optional(),
    segmentType: segmentTypeEnum.optional(),
    isDynamic: z.boolean().optional(),
    ruleDefinitionJson: z.unknown().optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.isDynamic != null && d.segmentType != null) {
      if (d.isDynamic && d.segmentType === CommsPlanAudienceSegmentType.STATIC) {
        ctx.addIssue({ code: "custom", message: "Dynamic mode cannot use segment type STATIC.", path: ["segmentType"] });
      }
      if (!d.isDynamic && d.segmentType === CommsPlanAudienceSegmentType.DYNAMIC) {
        ctx.addIssue({ code: "custom", message: "Static mode cannot use segment type DYNAMIC.", path: ["segmentType"] });
      }
    }
  });

export const archiveCommsPlanAudienceSegmentInputSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    comsPlanAudienceSegmentId: z.string().min(1),
  })
  .strict();

/** Exactly one identity key for static membership. */
export const addCommsPlanAudienceSegmentMemberInputSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    comsPlanAudienceSegmentId: z.string().min(1),
    userId: z.string().min(1).optional(),
    volunteerProfileId: z.string().min(1).optional(),
    crmContactKey: z.string().min(1).max(500).optional(),
    sourceType: sourceEnum.optional().default(CommsPlanAudienceSegmentMemberSource.MANUAL),
  })
  .strict()
  .superRefine((d, ctx) => {
    const n = [d.userId, d.volunteerProfileId, d.crmContactKey].filter(Boolean).length;
    if (n !== 1) {
      ctx.addIssue({ code: "custom", message: "Set exactly one of userId, volunteerProfileId, or crmContactKey." });
    }
  });

export const removeCommsPlanAudienceSegmentMemberInputSchema = z
  .object({
    communicationPlanId: z.string().min(1),
    comsPlanAudienceSegmentId: z.string().min(1),
    memberId: z.string().min(1),
  })
  .strict();
