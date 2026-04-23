import type { Dispatch, SetStateAction } from "react";
import type { AuthorStudioPostResponse } from "@/lib/author-studio/types";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";
import type { MasterAuthorStudioState } from "./masterAuthorTypes";
import type { DraftVersion, PlatformPackItem, ResearchWorkspaceState, TransformOutput } from "./masterAuthorTypes";

type SetMasterAuthorState = Dispatch<SetStateAction<MasterAuthorStudioState>>;

/**
 * Merges successful Author Studio `data` into local UI state. Extend as you lock down server shapes.
 * Stub responses use `data: null` — this is a no-op until handlers return payloads.
 */
export function applyAuthorStudioResponse(response: AuthorStudioPostResponse, setState: SetMasterAuthorState): void {
  if (!response.ok || response.data == null) return;
  const { produces, data } = response;
  if (typeof data !== "object") return;
  const d = data as Record<string, unknown>;

  if (produces === authorStudioOutputKinds.savedBrief && "brief" in d && d.brief && typeof d.brief === "object") {
    setState((s) => ({ ...s, brief: { ...s.brief, ...(d.brief as Partial<MasterAuthorStudioState["brief"]>) } }));
    return;
  }

  if (produces === authorStudioOutputKinds.savedBrief && "research" in d && d.research && typeof d.research === "object") {
    setState((s) => ({
      ...s,
      research: { ...s.research, ...(d.research as Partial<ResearchWorkspaceState>) },
    }));
    return;
  }

  if (produces === authorStudioOutputKinds.researchMemo && "research" in d && d.research && typeof d.research === "object") {
    setState((s) => ({
      ...s,
      research: { ...s.research, ...(d.research as Partial<ResearchWorkspaceState>) },
    }));
    return;
  }

  if (produces === authorStudioOutputKinds.draftSet && "compose" in d && d.compose && typeof d.compose === "object") {
    setState((s) => ({ ...s, compose: { ...s.compose, ...(d.compose as Partial<MasterAuthorStudioState["compose"]>) } }));
    return;
  }

  if (produces === authorStudioOutputKinds.draftSet && "alternates" in d && Array.isArray(d.alternates)) {
    setState((s) => ({ ...s, compose: { ...s.compose, alternates: d.alternates as DraftVersion[] } }));
    return;
  }

  if (produces === authorStudioOutputKinds.platformPack) {
    if ("platformPack" in d && Array.isArray(d.platformPack)) {
      setState((s) => ({ ...s, platformPack: d.platformPack as PlatformPackItem[] }));
      return;
    }
    if ("transforms" in d && Array.isArray(d.transforms)) {
      setState((s) => ({ ...s, transforms: d.transforms as TransformOutput[] }));
    }
  }

  if (produces === authorStudioOutputKinds.visualRequest && "visual" in d && d.visual && typeof d.visual === "object") {
    setState((s) => ({ ...s, visual: { ...s.visual, ...(d.visual as Partial<MasterAuthorStudioState["visual"]>) } }));
  }

  if (produces === authorStudioOutputKinds.visualPromptSet && "visual" in d && d.visual && typeof d.visual === "object") {
    setState((s) => ({ ...s, visual: { ...s.visual, ...(d.visual as Partial<MasterAuthorStudioState["visual"]>) } }));
  }

  if (produces === authorStudioOutputKinds.videoRepurposePlan && "video" in d && d.video && typeof d.video === "object") {
    setState((s) => ({ ...s, video: { ...s.video, ...(d.video as Partial<MasterAuthorStudioState["video"]>) } }));
  }

  if (produces === authorStudioOutputKinds.videoCutPlan && "video" in d && d.video && typeof d.video === "object") {
    setState((s) => ({ ...s, video: { ...s.video, ...(d.video as Partial<MasterAuthorStudioState["video"]>) } }));
  }

  if (produces === authorStudioOutputKinds.captionPackage && "video" in d && d.video && typeof d.video === "object") {
    setState((s) => ({ ...s, video: { ...s.video, ...(d.video as Partial<MasterAuthorStudioState["video"]>) } }));
  }

  if (produces === authorStudioOutputKinds.taskPackage && "approval" in d && d.approval && typeof d.approval === "object") {
    setState((s) => ({ ...s, approval: { ...s.approval, ...(d.approval as Partial<MasterAuthorStudioState["approval"]>) } }));
  }

  if (produces === authorStudioOutputKinds.exportPackage && "approval" in d && d.approval && typeof d.approval === "object") {
    setState((s) => ({ ...s, approval: { ...s.approval, ...(d.approval as Partial<MasterAuthorStudioState["approval"]>) } }));
  }
}
