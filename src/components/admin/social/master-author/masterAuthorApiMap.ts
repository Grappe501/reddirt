/**
 * Author Studio (Message OS) — canonical POST surface.
 * Implement in Next.js Route Handlers; keep OpenAI / tools on the server only.
 *
 * Design rule: every action should **materialize** one structured artifact (not
 * just a string). Responses use {@link AuthorStudioPostResponse} with `produces`
 * + `data`. See `src/lib/author-studio/types.ts`.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

import type { AuthorStudioStructuredOutputKind } from "@/lib/author-studio/types";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

/**
 * How backend capabilities map to tools (implementation detail on the server;
 * listed here for Cursor and humans when wiring feature code).
 *
 * - **Web search** — live issue research, opposition context, press context → often feeds `research_memo` before compose.
 * - **File search** — campaign memory, county files, policy docs, prior statements → `POST …/research/internal`.
 * - **Code interpreter** — transcript cleanup, caption files, analytics summaries, image/file transforms → often composes with video/package routes.
 * - **Image generation** — quote cards, concepts, thumbnails, flyer visuals → `…/visuals/*`.
 * - **File inputs** — upload transcripts, docs, briefs, source images → request `multipart` or signed URLs; merge into the same structured responses.
 * - **Function calling / MCP** — video pipeline, social scheduler, asset manager, analytics adapters → `package/*`, optional side-effects after structured result.
 */

/**
 * `MasterAuthorApiKey` is the 12 first-class POST entry points only.
 * Use `init` in `runBackendAction` to pass `intent` / `body` (e.g. research intent, persist brief) without new routes.
 */
export const MasterAuthorApiRoutes = {
  researchInternal: "/api/author-studio/research/internal",
  researchWeb: "/api/author-studio/research/web",
  composeDraft: "/api/author-studio/compose/draft",
  composeRewrite: "/api/author-studio/compose/rewrite",
  transformPlatformPack: "/api/author-studio/transform/platform-pack",
  visualsGeneratePrompts: "/api/author-studio/visuals/generate-prompts",
  visualsGenerateImages: "/api/author-studio/visuals/generate-images",
  videoAnalyzeTranscript: "/api/author-studio/video/analyze-transcript",
  videoBuildCutPlan: "/api/author-studio/video/build-cut-plan",
  videoGenerateCaptions: "/api/author-studio/video/generate-captions",
  packageCreateTasks: "/api/author-studio/package/create-tasks",
  packageExport: "/api/author-studio/package/export",
} as const;

export type MasterAuthorApiKey = keyof typeof MasterAuthorApiRoutes;

/**
 * Default structured artifact for each route in stub/initial implementations.
 * Real handlers may return a different `produces` when the request body requests
 * a sub-mode (e.g. `compose/draft` with persist brief).
 */
export const defaultProducesByRoute: Record<MasterAuthorApiKey, AuthorStudioStructuredOutputKind> = {
  researchInternal: authorStudioOutputKinds.researchMemo,
  researchWeb: authorStudioOutputKinds.researchMemo,
  composeDraft: authorStudioOutputKinds.draftSet,
  composeRewrite: authorStudioOutputKinds.draftSet,
  transformPlatformPack: authorStudioOutputKinds.platformPack,
  visualsGeneratePrompts: authorStudioOutputKinds.visualPromptSet,
  visualsGenerateImages: authorStudioOutputKinds.visualRequest,
  videoAnalyzeTranscript: authorStudioOutputKinds.videoRepurposePlan,
  videoBuildCutPlan: authorStudioOutputKinds.videoCutPlan,
  videoGenerateCaptions: authorStudioOutputKinds.captionPackage,
  packageCreateTasks: authorStudioOutputKinds.taskPackage,
  packageExport: authorStudioOutputKinds.exportPackage,
};
