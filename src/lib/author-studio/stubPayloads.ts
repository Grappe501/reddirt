/**
 * Zod-valid minimal payloads for Author Studio stub routes (TODO: replace with real generators).
 * Keep aligned with `outputSchemas` + `defaultProducesByRoute`.
 */

import { authorStudioOutputKinds } from "./types";
import type { AuthorStudioStructuredOutputKind } from "./types";

const ids = (x?: {
  socialContentItemId?: string;
  workflowIntakeId?: string;
  campaignEventId?: string;
  ownedMediaId?: string;
}) => ({
  socialContentItemId: x?.socialContentItemId,
  workflowIntakeId: x?.workflowIntakeId,
  campaignEventId: x?.campaignEventId,
  linkedOwnedMediaId: x?.ownedMediaId,
});

export function stubDataFor(
  kind: AuthorStudioStructuredOutputKind,
  ctx: { socialContentItemId?: string; workflowIntakeId?: string; campaignEventId?: string }
) {
  const base = ids(ctx);
  switch (kind) {
    case authorStudioOutputKinds.savedBrief:
      return { ...base, brief: { title: "TODO: persist brief" } };
    case authorStudioOutputKinds.researchMemo:
      return {
        ...base,
        research: {
          researchMemo: "TODO: internal corpus + file search — no LLM in this response path yet.",
        },
      };
    case authorStudioOutputKinds.draftSet:
      return {
        ...base,
        compose: {
          master: "TODO: compose/draft for real text",
          alternates: [
            { id: "stub-a", label: "A", body: "…", createdAt: new Date().toISOString() },
            { id: "stub-b", label: "B", body: "…", createdAt: new Date().toISOString() },
          ],
          compareLeftId: "stub-a",
          compareRightId: "stub-b",
          compareMode: false,
          length: "standard" as const,
        },
      };
    case authorStudioOutputKinds.platformPack:
      return {
        ...base,
        platformPack: [
          {
            id: "stub-pp-1",
            platform: "facebook",
            targetAccount: "—",
            objective: "TODO",
            scheduleAt: "",
            copy: "TODO",
            cta: "—",
            hashtags: "—",
            notes: "TODO",
            assetNote: "—",
            readiness: "draft" as const,
            socialPlatform: "FACEBOOK" as const,
          },
        ],
      };
    case authorStudioOutputKinds.taskPackage:
      return {
        ...base,
        createdTaskIds: [],
        tasks: [],
        approval: { linkedTasks: [] },
      };
    case authorStudioOutputKinds.visualRequest:
      return { ...base, visual: { imagePrompt: "TODO" } };
    case authorStudioOutputKinds.visualPromptSet:
      return {
        ...base,
        visual: {
          promptVersions: [
            { id: "pv-1", label: "Concept A", prompt: "TODO: model imagery prompt" },
            { id: "pv-2", label: "Concept B", prompt: "TODO: model imagery prompt" },
          ],
        },
      };
    case authorStudioOutputKinds.videoRepurposePlan:
      return {
        ...base,
        video: {
          clipSuggestions: ["TODO: beat 1", "TODO: beat 2"],
          hooks: "TODO: hooks",
        },
      };
    case authorStudioOutputKinds.videoCutPlan:
      return { ...base, video: { cutPlan: "TODO: cuts + timecodes; wire transcript + editor integration.", clipSuggestions: [] } };
    case authorStudioOutputKinds.captionPackage:
      return { ...base, video: { subtitles: "TODO: SRT/VTT or formatted captions" } };
    case authorStudioOutputKinds.exportPackage:
      return { ...base, approval: { exportNotes: "TODO: approved publish / export", checklist: [] } };
    default:
      return { ...base };
  }
}
