/**
 * Author Studio / Message OS — shared API contract.
 * Every POST under `/api/author-studio/*` should return a JSON body that names
 * which structured “artifact” the action produced (not only a text blob).
 */

export const authorStudioOutputKinds = {
  savedBrief: "saved_brief",
  researchMemo: "research_memo",
  draftSet: "draft_set",
  platformPack: "platform_pack",
  taskPackage: "task_package",
  visualRequest: "visual_request",
  visualPromptSet: "visual_prompt_set",
  videoRepurposePlan: "video_repurpose_plan",
  videoCutPlan: "video_cut_plan",
  captionPackage: "caption_package",
  exportPackage: "export_package",
} as const;

export type AuthorStudioStructuredOutputKind =
  (typeof authorStudioOutputKinds)[keyof typeof authorStudioOutputKinds];

/** Wire format for all Author Studio route handlers. */
export type AuthorStudioPostResponse = {
  ok: boolean;
  version: 1;
  /** URL segment (for debugging) e.g. `author-studio/compose/draft` */
  route: string;
  /**
   * Which artifact class this response materializes. Handlers that only validate
   * input may return `produces: null` with `ok: false`.
   */
  produces: AuthorStudioStructuredOutputKind | null;
  /** Structured payload; shape depends on `produces` (Zod on server, narrow on client as you wire it). */
  data: unknown;
  message?: string;
};
