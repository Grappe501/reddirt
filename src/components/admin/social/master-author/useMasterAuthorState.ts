"use client";

import { useCallback, useEffect, useState } from "react";
import { applyWorkItemBodyCopyFromStudioAction } from "@/app/admin/workbench-social-actions";
import type { AuthorStudioPostResponse } from "@/lib/author-studio/types";
import type { MasterAuthorStudioState, StudioTabId, PlatformPackItem, TransformOutput } from "./masterAuthorTypes";
import { createInitialMasterAuthorState } from "./masterAuthorMockState";
import type { MasterAuthorApiKey } from "./masterAuthorApiMap";
import { MasterAuthorApiRoutes } from "./masterAuthorApiMap";
import { applyAuthorStudioResponse } from "./applyAuthorStudioResponse";

export type { MasterAuthorApiKey } from "./masterAuthorApiMap";

const ROUTE_INPUT_DEFAULTS: Partial<Record<MasterAuthorApiKey, Record<string, unknown>>> = {
  composeDraft: { applyToWorkItem: true },
  composeRewrite: { applyToWorkItem: true },
  transformPlatformPack: { persistVariants: true, applyMasterToWorkItem: true },
};

const ROUTES_REQUIRING_WORKBENCH_REFRESH: MasterAuthorApiKey[] = [
  "composeDraft",
  "composeRewrite",
  "transformPlatformPack",
  "packageCreateTasks",
];

/** These routes use `authorStudioRequestBody` merge; other `/api/author-studio/*` routes still expect a flat body. */
const V2_REQUEST_BODY_ROUTES: Set<MasterAuthorApiKey> = new Set([
  "composeDraft",
  "composeRewrite",
  "transformPlatformPack",
  "packageCreateTasks",
]);

export type MasterAuthorWorkbenchContext = {
  socialContentItemId: string;
  campaignEventId?: string | null;
  workflowIntakeId?: string | null;
  onWorkbenchPersist?: () => void;
  /** When the workbench reloads a row, the compose master re-syncs from this value (e.g. after apply or save in Author Studio). */
  workItemBodyCopy?: string | null;
  workItemDetailUpdatedAt?: string | null;
};

function parseAuthorStudioResponse(json: unknown): AuthorStudioPostResponse | null {
  if (typeof json !== "object" || json === null) return null;
  const o = json as Record<string, unknown>;
  if (o.version !== 1) return null;
  if (typeof o.ok !== "boolean") return null;
  if (typeof o.route !== "string") return null;
  return json as AuthorStudioPostResponse;
}

/**
 * Build Author Studio v2 request body: `{ context, mode, input }`.
 * The server preprocess merges `input` with legacy flat fields (see `mergeAuthorStudioV2WithLegacy`).
 */
function buildAuthorStudioPostBody(
  key: MasterAuthorApiKey,
  label: string,
  workbench: MasterAuthorWorkbenchContext | null,
  init: Record<string, unknown> | undefined,
  requestMode: "preview" | "apply"
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    ...(ROUTE_INPUT_DEFAULTS[key] ?? {}),
    ...init,
    actionLabel: label,
  };
  const body: Record<string, unknown> = {
    mode: requestMode,
    input,
  };
  if (workbench?.socialContentItemId) {
    body.context = {
      socialContentItemId: workbench.socialContentItemId,
      ...(workbench.campaignEventId ? { campaignEventId: workbench.campaignEventId } : {}),
      ...(workbench.workflowIntakeId ? { workflowIntakeId: workbench.workflowIntakeId } : {}),
    };
  } else {
    body.context = {};
  }
  return body;
}

export function useMasterAuthorState(options?: { workbenchContext?: MasterAuthorWorkbenchContext | null }) {
  const [state, setState] = useState<MasterAuthorStudioState>(() => createInitialMasterAuthorState());
  const ctx = options?.workbenchContext ?? null;
  const workbenchId = ctx?.socialContentItemId;
  const [activeTab, setActiveTab] = useState<StudioTabId>("brief");
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const updateBrief = useCallback((patch: Partial<MasterAuthorStudioState["brief"]>) => {
    setState((s) => ({ ...s, brief: { ...s.brief, ...patch } }));
  }, []);

  const updateResearch = useCallback((patch: Partial<MasterAuthorStudioState["research"]>) => {
    setState((s) => ({ ...s, research: { ...s.research, ...patch } }));
  }, []);

  const updateCompose = useCallback((patch: Partial<MasterAuthorStudioState["compose"]>) => {
    setState((s) => ({ ...s, compose: { ...s.compose, ...patch } }));
  }, []);

  useEffect(() => {
    if (!workbenchId) return;
    if (ctx?.workItemDetailUpdatedAt == null) return;
    const next = ctx.workItemBodyCopy ?? "";
    setState((s) => {
      if (s.compose.master === next) return s;
      return { ...s, compose: { ...s.compose, master: next } };
    });
  }, [workbenchId, ctx?.workItemDetailUpdatedAt, ctx?.workItemBodyCopy]);

  const setTransforms = useCallback((transforms: TransformOutput[]) => {
    setState((s) => ({ ...s, transforms }));
  }, []);

  const updateTransform = useCallback((index: number, patch: Partial<TransformOutput>) => {
    setState((s) => {
      const t = [...s.transforms];
      t[index] = { ...t[index], ...patch };
      return { ...s, transforms: t };
    });
  }, []);

  const updateVisual = useCallback((patch: Partial<MasterAuthorStudioState["visual"]>) => {
    setState((s) => ({ ...s, visual: { ...s.visual, ...patch } }));
  }, []);

  const updateVideo = useCallback((patch: Partial<MasterAuthorStudioState["video"]>) => {
    setState((s) => ({ ...s, video: { ...s.video, ...patch } }));
  }, []);

  const setPlatformPack = useCallback((platformPack: PlatformPackItem[]) => {
    setState((s) => ({ ...s, platformPack }));
  }, []);

  const updatePlatformPack = useCallback((id: string, patch: Partial<PlatformPackItem>) => {
    setState((s) => ({
      ...s,
      platformPack: s.platformPack.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const updateApproval = useCallback((patch: Partial<MasterAuthorStudioState["approval"]>) => {
    setState((s) => ({ ...s, approval: { ...s.approval, ...patch } }));
  }, []);

  const toggleChecklist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      approval: {
        ...s.approval,
        checklist: s.approval.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
      },
    }));
  }, []);

  const saveAsAlternateDraft = useCallback(
    (body: string, label = "Studio alternate") => {
      const id = `alt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        compose: {
          ...s.compose,
          alternates: [
            ...s.compose.alternates,
            { id, label, body, createdAt: now },
          ],
        },
      }));
      setLastAction(`OK: added session-only compare row (“${label}”) — not saved to the work item.`);
    },
    []
  );

  const applyMasterToWorkItem = useCallback(
    async (bodyCopy: string) => {
      if (!workbenchId) {
        setLastAction("Select a work item in the queue to save master copy.");
        return;
      }
      setActionPending(true);
      setLastAction(null);
      try {
        const fd = new FormData();
        fd.set("socialContentItemId", workbenchId);
        fd.set("bodyCopy", bodyCopy);
        const r = await applyWorkItemBodyCopyFromStudioAction(fd);
        if (!r.ok) {
          setLastAction(`Error: Save master — ${r.error}`);
          return;
        }
        setLastAction("OK: Master copy saved to the work item.");
        ctx?.onWorkbenchPersist?.();
      } catch (e) {
        setLastAction(`Error: Save master — ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setActionPending(false);
      }
    },
    [workbenchId, ctx]
  );

  const runBackendAction = useCallback(
    async (key: MasterAuthorApiKey, label: string, init?: Record<string, unknown>, requestMode: "preview" | "apply" = "apply") => {
      setActionPending(true);
      setLastAction(null);
      const route = MasterAuthorApiRoutes[key];
      const useV2 = V2_REQUEST_BODY_ROUTES.has(key);
      const body = useV2
        ? buildAuthorStudioPostBody(key, label, ctx, init, requestMode)
        : (() => {
            const b: Record<string, unknown> = {
              actionLabel: label,
              ...init,
            };
            if (workbenchId) {
              b.socialContentItemId = workbenchId;
              if (ctx?.campaignEventId) b.campaignEventId = ctx.campaignEventId;
              if (ctx?.workflowIntakeId) b.workflowIntakeId = ctx.workflowIntakeId;
            }
            return b;
          })();
      try {
        const res = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const jsonUnknown: unknown = await res.json();
        const parsed = parseAuthorStudioResponse(jsonUnknown);
        if (!res.ok) {
          const msg =
            typeof jsonUnknown === "object" && jsonUnknown !== null && "message" in jsonUnknown
              ? String((jsonUnknown as { message?: unknown }).message)
              : res.statusText;
          setLastAction(`Error ${res.status}: ${label} — ${msg}`);
          return;
        }
        if (!parsed) {
          setLastAction(`Error: ${label} — response was not a valid AuthorStudioPostResponse (expected version 1).`);
          return;
        }
        applyAuthorStudioResponse(parsed, setState);
        setLastAction(
          `OK: ${label} → ${route} — ${requestMode} — produces: ${parsed.produces ?? "unspecified"}` + (parsed.message ? ` — ${parsed.message}` : ``)
        );
        if (parsed.ok && ROUTES_REQUIRING_WORKBENCH_REFRESH.includes(key)) {
          const pdata = parsed.data as { persistence?: { workbenchRefetch?: boolean } } | null | undefined;
          const wr = pdata?.persistence?.workbenchRefetch;
          if (wr === true) {
            ctx?.onWorkbenchPersist?.();
          } else if (wr === false) {
            /* explicit no refetch (compose preview with persistence echo) */
          } else if (requestMode === "apply") {
            ctx?.onWorkbenchPersist?.();
          }
        }
      } catch (e) {
        setLastAction(`Error: ${label} — ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setActionPending(false);
      }
    },
    [ctx]
  );

  const duplicateBrief = useCallback(() => {
    setState((s) => ({
      ...s,
      brief: { ...s.brief, title: `${s.brief.title} (copy)` },
    }));
    setLastAction("Brief duplicated in local state (TODO: persist via compose/draft with intent if needed)");
  }, []);

  const resetToMock = useCallback(() => {
    setState(createInitialMasterAuthorState());
    setLastAction("State reset to mock");
  }, []);

  return {
    state,
    activeTab,
    setActiveTab,
    lastAction,
    actionPending,
    updateBrief,
    updateResearch,
    updateCompose,
    setTransforms,
    updateTransform,
    updateVisual,
    updateVideo,
    setPlatformPack,
    updatePlatformPack,
    updateApproval,
    toggleChecklist,
    runBackendAction,
    applyMasterToWorkItem,
    saveAsAlternateDraft,
    duplicateBrief,
    resetToMock,
  };
}

export type MasterAuthorStateHook = ReturnType<typeof useMasterAuthorState>;
