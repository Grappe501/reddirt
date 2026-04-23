"use client";

/**
 * Master Author Studio / Message OS
 *
 * ## Component map (suggested)
 * - `useMasterAuthorState` — all client state for brief → export (swap for React Query + server when wired)
 * - `masterAuthorTypes` — DTOs shared with future API
 * - `masterAuthorApiMap` — internal route table for Route Handlers / Server Actions
 * - `MasterAuthorTabPanels` — per-tab content (add route-specific subcomponents as files grow)
 * - `ActionRail` — quick actions → `runBackendAction` → `POST` `/api/author-studio/*`
 * - `masterAuthorMockState` — default seed; replace with `GET` brief when wired
 *
 * ## OpenAI / tools (server-only)
 * - Responses must follow `AuthorStudioPostResponse` (`produces` + structured `data`) — see `src/lib/author-studio/types.ts`
 * - `masterAuthorApiMap` documents tool→capability mapping in its file-level JSDoc
 */

import { motion } from "framer-motion";
import { LayoutGrid, Library, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, UiButton } from "../social-ui-primitives";
import { ActionRail } from "./ActionRail";
import { MasterAuthorTabPanels } from "./MasterAuthorTabPanels";
import { useMasterAuthorState } from "./useMasterAuthorState";
import type { MediaRefListItem } from "@/lib/media-library/dto";
import type { SocialContentDraftListItem } from "@/lib/social/social-workbench-dto";
import type { MasterAuthorWorkbenchContext } from "./useMasterAuthorState";
import type { StudioTabId } from "./masterAuthorTypes";

const STUDIO_TABS: { id: StudioTabId; label: string; hint: string }[] = [
  { id: "brief", label: "Brief", hint: "Inputs & guardrails" },
  { id: "research", label: "Research", hint: "Files + web + memos" },
  { id: "compose", label: "Compose", hint: "Master + alts" },
  { id: "transform", label: "Transform", hint: "Channel forms" },
  { id: "visuals", label: "Visuals", hint: "Prompts & handoff" },
  { id: "video", label: "Video", hint: "Repurpose plan" },
  { id: "pack", label: "Platform Pack", hint: "Per-network cards" },
  { id: "export", label: "Approval", hint: "Release control" },
];

export function MasterAuthorStudio({
  workbenchContext,
  onOpenMediaLibrary,
  linkedMedia = [],
  platformVariantOptions = [],
  onLinkedMediaRefresh,
  persistedContentDrafts = [],
}: {
  workbenchContext?: MasterAuthorWorkbenchContext | null;
  onOpenMediaLibrary?: () => void;
  /** `SocialContentMediaRef` rows for this work item (OwnedMedia-backed). */
  linkedMedia?: MediaRefListItem[];
  platformVariantOptions?: { id: string; label: string }[];
  onLinkedMediaRefresh?: () => void;
  /** Server-persisted Author Studio compose alternates (see `getSocialContentWorkbenchDetail`). */
  persistedContentDrafts?: SocialContentDraftListItem[];
}) {
  const hook = useMasterAuthorState({ workbenchContext: workbenchContext ?? null });
  const { activeTab, setActiveTab, resetToMock, lastAction, actionPending } = hook;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <motion.div
          className="min-w-0 flex-1"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="overflow-hidden rounded-3xl border-slate-200/90 shadow-sm">
            <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50/80 to-white py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    Master Author Studio
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Message OS — one brief, many outputs. Actions call internal routes; no client OpenAI keys.
                    {workbenchContext?.socialContentItemId ? (
                      <span className="mt-1 block font-mono text-[10px] text-slate-500">
                        Bound to work item {workbenchContext.socialContentItemId.slice(0, 10)}…
                        {workbenchContext.campaignEventId ? " · event id in POST body" : ""}
                        {workbenchContext.workflowIntakeId ? " · intake id in POST body" : ""}
                      </span>
                    ) : (
                      <span className="mt-1 block text-[10px] text-amber-800/90">Select a queue item to attach Author Studio requests to a `SocialContentItem` id.</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {onOpenMediaLibrary ? (
                    <UiButton
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-xs"
                      onClick={onOpenMediaLibrary}
                      type="button"
                      title="Attach campaign-owned media (Indexed OwnedMediaAsset)"
                    >
                      <Library className="h-3.5 w-3.5" />
                      Media library
                    </UiButton>
                  ) : null}
                  <UiButton size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={resetToMock} type="button">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset mock
                  </UiButton>
                </div>
              </div>
              {lastAction ? <p className="mt-2 font-mono text-[10px] text-slate-500">{lastAction}</p> : null}
            </CardHeader>
            <CardContent className="p-0">
              <div className="sticky top-0 z-10 -mx-px border-b border-slate-200/80 bg-white/90 px-2 py-2 backdrop-blur sm:px-3">
                <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {STUDIO_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      title={t.hint}
                      className={cn(
                        "shrink-0 rounded-xl px-2.5 py-1.5 text-left text-[11px] font-semibold sm:px-3 sm:text-xs",
                        activeTab === t.id
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 sm:p-4">
                {actionPending ? (
                  <p className="mb-2 text-xs text-slate-500" role="status">
                    Working…
                  </p>
                ) : null}
                <MasterAuthorTabPanels
                  hook={hook}
                  activeTab={activeTab}
                  persistedContentDrafts={persistedContentDrafts}
                  mediaContext={{
                    socialContentItemId: workbenchContext?.socialContentItemId ?? "",
                    linkedMedia,
                    platformVariants: platformVariantOptions,
                    onRefresh: onLinkedMediaRefresh,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <div className="w-full shrink-0 lg:sticky lg:top-2 lg:max-w-[20rem] lg:self-start">
          <ActionRail hook={hook} />
        </div>
      </div>
    </div>
  );
}

export function TaskFlowCard({
  className,
  statusColor,
  tasks,
}: {
  className?: string;
  statusColor: (s: string) => string;
  tasks: readonly { id?: string; title: string; due: string; owner: string; status: string }[];
}) {
  return (
    <Card className={cn("rounded-3xl border-slate-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="h-5 w-5" />
          Task Flow
        </CardTitle>
        <CardDescription>
          <code className="text-[10px]">CampaignTask</code> rows with <code className="text-[10px]">socialContentItemId</code> (when present)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id ?? task.title} className="rounded-2xl border border-slate-200 p-3 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-5 text-slate-900">{task.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Owner: {task.owner} · Due: {task.due}
                </div>
              </div>
              <span
                className={cn("inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium", statusColor(task.status))}
              >
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
