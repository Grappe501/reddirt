import {
  OwnedMediaColorLabel,
  OwnedMediaPickStatus,
} from "@prisma/client";
import { z } from "zod";

const idList = z
  .string()
  .min(1)
  .transform((s) =>
    s
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean)
  )
  .pipe(z.array(z.string().min(1)).max(500));

export const bulkMediaCenterGovernanceFormSchema = z
  .object({
    assetIds: idList,
    returnPath: z.string().min(1).max(4000),
    intent: z.enum([
      "favorite_on",
      "favorite_off",
      "set_pick",
      "set_color",
      "press_on",
      "press_off",
      "site_on",
      "site_off",
      "mark_reviewed",
      "clear_reviewed",
      "clear_pick_and_color",
      "add_to_collection",
    ]),
    pickStatus: z.nativeEnum(OwnedMediaPickStatus).optional(),
    colorLabel: z.nativeEnum(OwnedMediaColorLabel).optional(),
    collectionId: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.intent === "set_pick" && val.pickStatus == null) {
      ctx.addIssue({ code: "custom", message: "pickStatus required", path: ["pickStatus"] });
    }
    if (val.intent === "set_color" && val.colorLabel == null) {
      ctx.addIssue({ code: "custom", message: "colorLabel required", path: ["colorLabel"] });
    }
    if (val.intent === "add_to_collection" && !val.collectionId) {
      ctx.addIssue({ code: "custom", message: "collectionId required", path: ["collectionId"] });
    }
  });

export type BulkMediaCenterGovernanceInput = z.infer<typeof bulkMediaCenterGovernanceFormSchema>;
