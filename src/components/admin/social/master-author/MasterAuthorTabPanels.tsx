"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRightLeft, CheckSquare, ChevronsRight, Copy, FileJson2, GanttChart, Globe2, ImageIcon, Layers3, ListChecks, Pin, Sparkles, Subtitles, Video, Wand2 } from "lucide-react";
import { OwnedMediaKind, SocialContentMediaRefPurpose } from "@prisma/client";
import { updateSocialContentMediaRefAction } from "@/app/admin/media-library-actions";
import { createMediaWorkflowTaskPackAction, type MediaWorkflowPreset } from "@/app/admin/workbench-social-actions";
import type { MediaRefListItem } from "@/lib/media-library/dto";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import type { SocialContentDraftListItem } from "@/lib/social/social-workbench-dto";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, UiBadge, UiButton, UiInput, NativeSelect, UiScrollArea, UiTextarea } from "../social-ui-primitives";
import type { MasterAuthorStateHook } from "./useMasterAuthorState";
import type { StudioTabId } from "./masterAuthorTypes";
import { MasterAuthorApiRoutes, type MasterAuthorApiKey } from "./masterAuthorApiMap";

const lab = "mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500";
const inp = "rounded-lg border border-slate-200 bg-white text-sm";
const sec = "rounded-xl border border-slate-200/80 bg-slate-50/50 p-3";

function TabShell({
  id,
  active,
  children,
}: {
  id: StudioTabId;
  active: StudioTabId;
  children: React.ReactNode;
}) {
  if (active !== id) return null;
  return <div className="min-h-[360px]">{children}</div>;
}

export type AuthorStudioMediaContext = {
  socialContentItemId: string;
  linkedMedia: MediaRefListItem[];
  platformVariants: { id: string; label: string }[];
  onRefresh?: () => void;
};

export function MasterAuthorTabPanels({
  hook,
  activeTab,
  mediaContext = { socialContentItemId: "", linkedMedia: [], platformVariants: [] },
  persistedContentDrafts = [],
}: {
  hook: MasterAuthorStateHook;
  activeTab: StudioTabId;
  mediaContext?: AuthorStudioMediaContext;
  persistedContentDrafts?: SocialContentDraftListItem[];
}) {
  const [mediaTaskMsg, setMediaTaskMsg] = useState<string | null>(null);
  const [studioDraftLabel, setStudioDraftLabel] = useState("");
  const [mediaTaskPending, startMediaTask] = useTransition();
  const [transcriptRefId, setTranscriptRefId] = useState<string>("");
  const [, startPackMedia] = useTransition();

  const { socialContentItemId, linkedMedia, platformVariants, onRefresh } = mediaContext;
  const {
    state,
    runBackendAction,
    applyMasterToWorkItem,
    saveAsAlternateDraft,
    actionPending,
    updateBrief,
    updateResearch,
    updateCompose,
    updateTransform,
    updateVisual,
    updateVideo,
    setPlatformPack,
    updatePlatformPack,
    updateApproval,
    toggleChecklist,
    duplicateBrief,
  } = hook;
  const { brief, research, compose, transforms, visual, video, platformPack, approval } = state;

  const briefForCompose = useMemo(
    () => ({
      title: brief.title,
      campaignGoal: brief.campaignGoal,
      messageType: brief.messageType,
      audience: brief.audience,
      tone: brief.tone,
      voiceMode: brief.voiceMode,
      countyOrRegion: brief.countyOrRegion,
      cta: brief.cta,
    }),
    [brief.title, brief.campaignGoal, brief.messageType, brief.audience, brief.tone, brief.voiceMode, brief.countyOrRegion, brief.cta]
  );

  const withTranscript = linkedMedia.filter((r) => r.media.hasTranscript);
  const mediaForTranscript = withTranscript.length > 0 ? withTranscript : linkedMedia;
  const firstVideoRef = linkedMedia.find(
    (r) => r.purpose === SocialContentMediaRefPurpose.VIDEO_REPURPOSE || r.media.kind === OwnedMediaKind.VIDEO
  );
  const firstVisualRef = linkedMedia.find(
    (r) => r.purpose === SocialContentMediaRefPurpose.VISUAL || r.media.kind === OwnedMediaKind.IMAGE
  );
  const visualLinked = linkedMedia.filter(
    (r) => r.purpose === SocialContentMediaRefPurpose.VISUAL || r.media.kind === OwnedMediaKind.IMAGE
  );
  const videoLinked = linkedMedia.filter(
    (r) => r.purpose === SocialContentMediaRefPurpose.VIDEO_REPURPOSE || r.media.kind === OwnedMediaKind.VIDEO
  );
  const selectedTranscriptRef = transcriptRefId
    ? (linkedMedia.find((r) => r.refId === transcriptRefId) ?? mediaForTranscript[0])
    : mediaForTranscript[0];

  const runMediaTaskPreset = (preset: MediaWorkflowPreset) => {
    if (!socialContentItemId) {
      setMediaTaskMsg("Select a work item in the queue first.");
      return;
    }
    setMediaTaskMsg(null);
    startMediaTask(async () => {
      const r = await createMediaWorkflowTaskPackAction(socialContentItemId, preset, {
        refId: selectedTranscriptRef?.refId,
        ownedMediaId: selectedTranscriptRef?.media.id,
      });
      if (r.ok) {
        setMediaTaskMsg(`Created ${r.count} task(s).`);
        onRefresh?.();
      } else {
        setMediaTaskMsg(r.error);
      }
    });
  };

  const transcriptPayload = (intent: string) => {
    const m = selectedTranscriptRef;
    if (!m) return null;
    const base: Record<string, unknown> = { ownedMediaId: m.media.id, socialContentMediaRefId: m.refId, intent };
    if (!m.media.hasTranscript) {
      base.intent = `${intent}_stub_no_transcript`;
    }
    return base;
  };

  const runTranscriptRoute = (label: string, routeKey: MasterAuthorApiKey, intent: string) => {
    const payload = transcriptPayload(intent);
    if (!payload) {
      setMediaTaskMsg("No linked media to scope this action.");
      return;
    }
    if (!selectedTranscriptRef?.media.hasTranscript) {
      setMediaTaskMsg("No transcript on file — running stub (add ASR in Owned Media to enable real output).");
    } else {
      setMediaTaskMsg(null);
    }
    void runBackendAction(routeKey, label, payload);
  };

  const assignRefToVariant = (refId: string, platformVariantId: string) => {
    startPackMedia(async () => {
      const tryOnce = (confirmUnapproved?: boolean) =>
        updateSocialContentMediaRefAction(refId, {
          purpose: SocialContentMediaRefPurpose.PLATFORM_VARIANT,
          socialPlatformVariantId: platformVariantId,
          confirmUnapproved,
        });
      let u = await tryOnce();
      if (!u.ok && u.error === "UNAPPROVED_NEEDS_CONFIRM") {
        if (typeof window !== "undefined" && !window.confirm("This asset is not approved for social. Assign it to this platform variant anyway?")) {
          return;
        }
        u = await tryOnce(true);
      }
      if (u.ok) {
        onRefresh?.();
        setMediaTaskMsg("Updated media ref for this variant.");
      } else {
        setMediaTaskMsg(u.error);
      }
    });
  };

  return (
    <>
      <TabShell id="brief" active={activeTab}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">Message brief</h3>
            <div className="flex flex-wrap gap-1.5">
              <UiButton
                size="sm"
                variant="outline"
                className="rounded-lg text-xs"
                disabled={actionPending}
                onClick={() => {
                  void runBackendAction("composeDraft", "Save brief", { intent: "persist_brief" }, "apply");
                }}
              >
                Save brief
              </UiButton>
              <UiButton size="sm" variant="outline" className="rounded-lg text-xs" onClick={duplicateBrief}>
                Duplicate brief
              </UiButton>
              <select
                className={cn("rounded-lg border border-slate-200 px-2 py-1.5 text-xs", inp)}
                defaultValue=""
                onChange={() => {
                  // TODO: GET briefLoad?source=social|intake|event&id=
                }}
              >
                <option value="">Load from…</option>
                <option value="social">SocialContentItem (scaffold)</option>
                <option value="intake">WorkflowIntake (scaffold)</option>
                <option value="event">CampaignEvent (scaffold)</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <span className={lab}>Title</span>
              <UiInput className={inp} value={brief.title} onChange={(e) => updateBrief({ title: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Urgency</span>
              <NativeSelect
                value={brief.urgency}
                onValueChange={(v) => updateBrief({ urgency: v as typeof brief.urgency })}
                className="rounded-lg"
                options={[
                  { value: "routine", label: "Routine" },
                  { value: "standard", label: "Standard" },
                  { value: "urgent", label: "Urgent" },
                  { value: "breaking", label: "Breaking" },
                ]}
                aria-label="Urgency"
              />
            </div>
            <div className="md:col-span-2">
              <span className={lab}>Campaign goal</span>
              <UiTextarea className={cn("min-h-[52px]", inp)} value={brief.campaignGoal} onChange={(e) => updateBrief({ campaignGoal: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Message type</span>
              <UiInput className={inp} value={brief.messageType} onChange={(e) => updateBrief({ messageType: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Voice mode</span>
              <NativeSelect
                value={brief.voiceMode}
                onValueChange={(v) => updateBrief({ voiceMode: v as typeof brief.voiceMode })}
                className="rounded-lg"
                options={[
                  { value: "candidate", label: "Candidate" },
                  { value: "campaign", label: "Campaign" },
                  { value: "grassroots", label: "Grassroots" },
                  { value: "faith", label: "Faith" },
                  { value: "contrast", label: "Contrast" },
                  { value: "calm", label: "Calm" },
                ]}
                aria-label="Voice mode"
              />
            </div>
            <div>
              <span className={lab}>Tone</span>
              <UiInput className={inp} value={brief.tone} onChange={(e) => updateBrief({ tone: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Audience</span>
              <UiInput className={inp} value={brief.audience} onChange={(e) => updateBrief({ audience: e.target.value })} />
            </div>
            <div>
              <span className={lab}>County / region</span>
              <UiInput className={inp} value={brief.countyOrRegion} onChange={(e) => updateBrief({ countyOrRegion: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Issue tags</span>
              <UiInput className={inp} value={brief.issueTags} onChange={(e) => updateBrief({ issueTags: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Event link</span>
              <UiInput className={inp} value={brief.eventLink} onChange={(e) => updateBrief({ eventLink: e.target.value })} placeholder="https://" />
            </div>
            <div>
              <span className={lab}>CTA</span>
              <UiInput className={inp} value={brief.cta} onChange={(e) => updateBrief({ cta: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <span className={lab}>Opposition context</span>
              <UiTextarea className={cn("min-h-[56px]", inp)} value={brief.oppositionContext} onChange={(e) => updateBrief({ oppositionContext: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Must include</span>
              <UiTextarea className={cn("min-h-[56px]", inp)} value={brief.mustInclude} onChange={(e) => updateBrief({ mustInclude: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Must avoid</span>
              <UiTextarea className={cn("min-h-[56px]", inp)} value={brief.mustAvoid} onChange={(e) => updateBrief({ mustAvoid: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <span className={lab}>Source assets</span>
              <UiTextarea className={cn("min-h-[44px]", inp)} value={brief.sourceAssets} onChange={(e) => updateBrief({ sourceAssets: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <span className={lab}>Notes</span>
              <UiTextarea className={cn("min-h-[64px]", inp)} value={brief.notes} onChange={(e) => updateBrief({ notes: e.target.value })} />
            </div>
          </div>
          {linkedMedia.length > 0 ? (
            <div className={sec}>
              <div className="mb-2 text-xs font-bold text-slate-700">Source assets (linked Owned Media)</div>
              <p className="mb-2 text-[10px] text-slate-500">
                Pulled from this work item’s <code className="rounded bg-slate-100 px-0.5">SocialContentMediaRef</code> rows. Use Media library in the workbench to attach or remove.
              </p>
              <ul className="space-y-2">
                {linkedMedia.map((r) => {
                  const m = r.media;
                  const unapproved = !m.approvedForSocial;
                  return (
                    <li key={r.refId} className="flex flex-wrap items-start gap-2 rounded-lg border border-white/60 bg-white p-2 text-xs">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                        {m.kind === OwnedMediaKind.IMAGE ? (
                          <img src={m.previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-800">{m.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {m.fileName} · {socialEnumLabel(r.purpose)} · {m.hasTranscript ? "transcript" : "no transcript"}
                        </div>
                        {unapproved ? (
                          <span className="mt-0.5 inline-block rounded border border-amber-400 bg-amber-50 px-1.5 text-[9px] font-bold uppercase text-amber-900">
                            Not approved for social
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No linked media for this work item. Open the media library from the workbench to attach source assets.</p>
          )}
        </div>
      </TabShell>

      <TabShell id="research" active={activeTab}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Split workspace — <code className="rounded bg-slate-100 px-0.5 text-[10px]">file / corpus</code> (
            {MasterAuthorApiRoutes.researchInternal} → <code className="text-[10px]">research_memo</code>
            ) and <code className="rounded bg-slate-100 px-0.5 text-[10px]">web</code> ({MasterAuthorApiRoutes.researchWeb}).
          </p>
          <div className="grid min-h-[320px] gap-3 lg:grid-cols-3">
            <div className={sec}>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FileJson2 className="h-3.5 w-3.5" /> Campaign file context
              </div>
              <UiScrollArea className="max-h-48 text-xs">
                {research.fileContext.map((f) => (
                  <div key={f.id} className="mb-2 rounded-lg border border-white/50 bg-white p-2">
                    <div className="font-medium">{f.name}</div>
                    <p className="text-slate-500">{f.snippet}</p>
                  </div>
                ))}
              </UiScrollArea>
            </div>
            <div className={sec}>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Globe2 className="h-3.5 w-3.5" /> Web research
              </div>
              {research.webPanel.map((w) => (
                <div key={w.id} className="mb-2 rounded-lg border border-white/50 bg-white p-2 text-xs">
                  <a href={w.url} className="font-medium text-slate-800 underline" target="_blank" rel="noreferrer">
                    {w.title}
                  </a>
                  <p className="text-slate-500">{w.note}</p>
                </div>
              ))}
            </div>
            <div className={sec}>
              <div className="mb-2 text-xs font-bold text-slate-700">Source notes &amp; citations</div>
              <UiTextarea className={cn("min-h-[72px] text-xs", inp)} value={research.sourceNotes} onChange={(e) => updateResearch({ sourceNotes: e.target.value })} />
              {research.citations.map((c) => (
                <p key={c.id} className="mt-1 text-xs text-slate-600">
                  <span className="text-slate-400">{c.source}:</span> {c.text}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <span className={lab}>Research memo (generated)</span>
              <UiTextarea className={cn("min-h-[100px] text-sm", inp)} value={research.summaryMemo} onChange={(e) => updateResearch({ summaryMemo: e.target.value })} placeholder="Synthesis appears here after API run…" />
            </div>
            <div>
              <span className={lab}>Rebuttal context</span>
              <UiTextarea className={cn("min-h-[100px] text-sm", inp)} value={research.rebuttalContext} onChange={(e) => updateResearch({ rebuttalContext: e.target.value })} />
            </div>
            <div>
              <span className={lab}>County context</span>
              <UiTextarea className={cn("min-h-[80px] text-sm", inp)} value={research.countyContext} onChange={(e) => updateResearch({ countyContext: e.target.value })} />
            </div>
            <div>
              <span className={lab}>What we’ve said before</span>
              <UiTextarea className={cn("min-h-[80px] text-sm", inp)} value={research.priorSaid} onChange={(e) => updateResearch({ priorSaid: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["extractFacts", "Extract facts"] as const,
                ["researchMemo", "Build research memo"] as const,
                ["rebuttalContext", "Rebuttal context (AI)"] as const,
                ["countyContext", "County context (AI)"] as const,
                ["priorStatements", "What we said (search)"] as const,
              ] as const
            ).map(([intent, label]) => (
              <UiButton
                key={intent}
                size="sm"
                variant="outline"
                className="rounded-lg text-xs"
                disabled={actionPending}
                onClick={() => void runBackendAction("researchInternal", label, { intent })}
              >
                {label}
              </UiButton>
            ))}
            <UiButton
              size="sm"
              variant="default"
              className="rounded-lg text-xs"
              disabled={actionPending}
              onClick={() => void runBackendAction("researchWeb", "Web research (opposition / press / live issue)")}
            >
              Web research
            </UiButton>
            <UiButton size="sm" className="rounded-lg text-xs" variant="default" onClick={() => updateCompose({ master: research.summaryMemo || compose.master })} disabled={!research.summaryMemo}>
              <Pin className="h-3.5 w-3.5" />
              Pin to compose
            </UiButton>
          </div>
        </div>
      </TabShell>

      <TabShell id="compose" active={activeTab}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={compose.compareMode}
                  onChange={(e) => updateCompose({ compareMode: e.target.checked })}
                />
                Compare two versions
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <NativeSelect
                value={compose.length}
                onValueChange={(v) => updateCompose({ length: v as typeof compose.length })}
                className="w-36"
                options={[
                  { value: "tight", label: "Length: tight" },
                  { value: "standard", label: "Length: standard" },
                  { value: "long", label: "Length: long" },
                ]}
                aria-label="Target length"
              />
              <UiButton
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={actionPending}
                onClick={() =>
                  void runBackendAction("composeRewrite", "Preview AI rewrite", {
                    length: compose.length,
                    sourceText: compose.master,
                  }, "preview")
                }
                title="Returns draft_set only; no work item write"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Preview rewrite
              </UiButton>
              <UiButton
                size="sm"
                variant="default"
                className="text-xs"
                disabled={actionPending}
                onClick={() =>
                  void runBackendAction("composeRewrite", "Apply rewrite to master", {
                    length: compose.length,
                    sourceText: compose.master,
                    persistenceIntent: "apply_to_master",
                  }, "apply")
                }
                title="Runs heuristics and updates SocialContentItem.bodyCopy when a work item is selected"
              >
                Apply rewrite
              </UiButton>
              <UiButton
                size="sm"
                variant="default"
                className="text-xs"
                disabled={actionPending}
                onClick={() =>
                  void runBackendAction("composeRewrite", "Replace master with rewrite", {
                    length: compose.length,
                    sourceText: compose.master,
                    persistenceIntent: "replace_master",
                  }, "apply")
                }
                title="Replace body copy; clears isApplied on saved server drafts for this work item"
              >
                Replace master (rewrite)
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={actionPending}
                onClick={() =>
                  void runBackendAction("composeRewrite", "Save rewrite as alternate draft", {
                    length: compose.length,
                    sourceText: compose.master,
                    persistenceIntent: "save_draft",
                    draftTitle: studioDraftLabel.trim() || "Rewrite alternate",
                  }, "apply")
                }
                title="Persist structured SocialContentDraft (server)"
              >
                <Copy className="h-3.5 w-3.5" />
                Save rewrite as draft
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={actionPending}
                onClick={() => void applyMasterToWorkItem(compose.master)}
                title="Writes the current master text to SocialContentItem.bodyCopy (no rewrite pass)"
              >
                <Pin className="h-3.5 w-3.5" />
                Apply to master copy
              </UiButton>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UiInput
              className={cn("h-8 max-w-xs text-xs", inp)}
              placeholder="Label for saved drafts (optional)"
              value={studioDraftLabel}
              onChange={(e) => setStudioDraftLabel(e.target.value)}
              aria-label="Label for saved alternate drafts"
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Preview: structured response only. Apply / replace / save: persists via compose routes when a work item is bound. “Apply to master copy” saves the
            current editor text as-is.
          </p>
          <div className="flex flex-wrap gap-1">
            <UiButton
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction(
                  "composeDraft",
                  "Preview draft from brief",
                  { intent: "from_brief", brief: briefForCompose, compose: { master: compose.master } },
                  "preview"
                )
              }
            >
              Preview draft
            </UiButton>
            <UiButton
              size="sm"
              variant="default"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction(
                  "composeDraft",
                  "Apply master from compose",
                  { intent: "from_brief", brief: briefForCompose, compose: { master: compose.master }, persistenceIntent: "apply_to_master" },
                  "apply"
                )
              }
            >
              Apply to master
            </UiButton>
            <UiButton
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction(
                  "composeDraft",
                  "Replace existing master",
                  { intent: "from_brief", brief: briefForCompose, compose: { master: compose.master }, persistenceIntent: "replace_master" },
                  "apply"
                )
              }
            >
              Replace existing master
            </UiButton>
            <UiButton
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction(
                  "composeDraft",
                  "Save as alternate draft",
                  {
                    intent: "from_brief",
                    brief: briefForCompose,
                    compose: { master: compose.master },
                    persistenceIntent: "save_draft",
                    draftTitle: studioDraftLabel.trim() || "Alternate draft",
                  },
                  "apply"
                )
              }
            >
              Save as alternate draft
            </UiButton>
            <UiButton
              size="sm"
              variant="ghost"
              className="text-xs text-slate-500"
              type="button"
              onClick={() => saveAsAlternateDraft(compose.master, studioDraftLabel.trim() || "Local alternate")}
              title="Local session only; use “Save as alternate draft” to persist to the work item"
            >
              Local alternate only
            </UiButton>
          </div>
          {compose.compareMode ? (
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <span className={lab}>Version A (master or alternate id)</span>
                <UiTextarea className={cn("min-h-[200px] font-mono text-sm", inp)} value={compose.master} onChange={(e) => updateCompose({ master: e.target.value })} />
              </div>
              <div>
                <span className={lab}>Version B (alternate)</span>
                <UiTextarea
                  className={cn("min-h-[200px] font-mono text-sm", inp)}
                  value={compose.alternates[0]?.body ?? ""}
                  onChange={(e) => {
                    const a = [...compose.alternates];
                    if (a[0]) a[0] = { ...a[0], body: e.target.value };
                    updateCompose({ alternates: a });
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <span className={lab}>Master message</span>
              <UiTextarea className={cn("min-h-[220px] text-sm", inp)} value={compose.master} onChange={(e) => updateCompose({ master: e.target.value })} />
            </div>
          )}
          <div>
            <span className={lab}>Alternate drafts</span>
            <ul className="space-y-2">
              {compose.alternates.map((d) => (
                <li key={d.id} className="rounded-xl border border-slate-200 bg-white p-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <UiBadge>{d.label}</UiBadge>
                    <span className="text-slate-400">{d.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-700">{d.body}</p>
                </li>
              ))}
            </ul>
          </div>
          {persistedContentDrafts.length > 0 ? (
            <div>
              <span className={lab}>Saved drafts (work item)</span>
              <p className="mb-2 text-[10px] text-slate-500">
                Use in editor loads text only. Apply as master runs compose/draft with <code className="text-[9px]">selectedContentDraftId</code> (server applies
                that copy to <code className="text-[9px]">bodyCopy</code>).
              </p>
              <ul className="space-y-2">
                {persistedContentDrafts.map((d) => (
                  <li key={d.id} className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-2">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs">
                      <UiBadge className="bg-white/80">{d.title?.trim() || d.sourceIntent || "Draft"}</UiBadge>
                      <span className="text-slate-500">
                        {d.createdAt}
                        {d.isApplied ? " · applied" : ""}
                      </span>
                    </div>
                    {d.createdByName || d.createdByEmail ? (
                      <p className="mb-1 text-[10px] text-slate-500">
                        By {d.createdByName ?? d.createdByEmail ?? "—"}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap font-mono text-xs text-slate-800">{d.bodyCopy}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {(d.sourceRoute ?? "—")} · {d.sourceIntent ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <UiButton
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        type="button"
                        disabled={!socialContentItemId}
                        onClick={() => updateCompose({ master: d.bodyCopy })}
                        title="Load this text into the master editor (local only)"
                      >
                        Use in editor
                      </UiButton>
                      <UiButton
                        size="sm"
                        variant="default"
                        className="h-7 text-[10px]"
                        disabled={actionPending || !socialContentItemId}
                        onClick={() =>
                          void runBackendAction(
                            "composeDraft",
                            "Apply saved draft to master",
                            {
                              intent: "from_brief",
                              brief: briefForCompose,
                              compose: { master: d.bodyCopy },
                              persistenceIntent: "apply_to_master",
                              selectedContentDraftId: d.id,
                            },
                            "apply"
                          )
                        }
                        title="POST compose/draft: apply_to_master with selectedContentDraftId"
                      >
                        Apply as master
                      </UiButton>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <span className={lab}>Quick style (preview only — use Apply to master / Save as alternate draft to persist)</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(
                [
                  "sharper",
                  "warmer",
                  "more local",
                  "faith-centered",
                  "more contrast",
                  "speech",
                  "statement",
                  "faq",
                  "talking_points",
                ] as const
              ).map((k) => (
                <UiButton
                  key={k}
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-md px-2 text-[10px]"
                  onClick={() => {
                    void runBackendAction("composeDraft", `Style preview: ${k}`, {
                      intent: "style_transform",
                      target: k,
                      brief: briefForCompose,
                      compose: { master: compose.master },
                    }, "preview");
                  }}
                >
                  {k.replaceAll("_", " ")}
                </UiButton>
              ))}
            </div>
          </div>
        </div>
      </TabShell>

      <TabShell id="transform" active={activeTab}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">Per-kind outputs. Batch → {MasterAuthorApiRoutes.transformPlatformPack} (structured platform_pack).</p>
            <div className="flex flex-wrap gap-1">
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => {
                  void runBackendAction("transformPlatformPack", "Preview platform pack", { intent: "batch" }, "preview");
                }}
              >
                <Layers3 className="h-4 w-4" />
                Preview
              </UiButton>
              <UiButton
                size="sm"
                disabled={actionPending}
                onClick={() => {
                  void runBackendAction("transformPlatformPack", "Batch generate + persist", { intent: "batch" }, "apply");
                }}
              >
                <Layers3 className="h-4 w-4" />
                Apply
              </UiButton>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
            {transforms.map((t, i) => (
              <Card key={`${t.kind}-${i}`} className="rounded-2xl border-slate-200">
                <CardHeader className="py-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{t.label}</CardTitle>
                    {t.refined ? <UiBadge className="bg-emerald-100 text-emerald-800">refined</UiBadge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <UiTextarea
                    className={cn("min-h-[100px] text-sm", inp)}
                    value={t.body}
                    onChange={(e) => updateTransform(i, { body: e.target.value })}
                    placeholder="Generated or hand-edited per channel…"
                  />
                  <div className="flex gap-1">
                    <UiButton
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        void runBackendAction("transformPlatformPack", `Refine: ${t.label}`, { intent: "refine", kind: t.kind });
                        updateTransform(i, { refined: true });
                      }}
                    >
                      Refine
                    </UiButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabShell>

      <TabShell id="visuals" active={activeTab}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Ideation and prompts — <strong>image generation and designer handoff are server-side</strong> (prompts: {MasterAuthorApiRoutes.visualsGeneratePrompts}; images: {MasterAuthorApiRoutes.visualsGenerateImages}).
          </p>
          {firstVisualRef || visualLinked.length > 0 ? (
            <div className={sec}>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ImageIcon className="h-3.5 w-3.5" />
                Visual source (linked)
              </div>
              <p className="mb-2 text-[10px] text-slate-500">
                Prefer refs with purpose <code className="rounded bg-slate-100 px-0.5">VISUAL</code> or image kind. Thumbnails use path-safe preview URLs only.
              </p>
              <ul className="space-y-2">
                {(visualLinked.length > 0 ? visualLinked : linkedMedia.slice(0, 1)).map((r) => (
                  <li key={r.refId} className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white p-2 text-xs">
                    <div className="h-10 w-14 overflow-hidden rounded bg-slate-100">
                      {r.media.kind === OwnedMediaKind.IMAGE ? (
                        <img src={r.media.previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{r.media.title}</div>
                      <div className="text-[10px] text-slate-500">{socialEnumLabel(r.purpose)}</div>
                      {!r.media.approvedForSocial ? (
                        <span className="text-[9px] font-bold uppercase text-amber-800">Unapproved</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-amber-800/90">No visual-tagged media linked. Attach stills or graphics from the workbench media library (purpose: Visual / graphic).</p>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <span className={lab}>Image / scene prompt</span>
              <UiTextarea className={cn("min-h-[100px] text-sm", inp)} value={visual.imagePrompt} onChange={(e) => updateVisual({ imagePrompt: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Style references (notes, links)</span>
              <UiTextarea className={cn("min-h-[100px] text-sm", inp)} value={visual.styleNotes} onChange={(e) => updateVisual({ styleNotes: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Quote card — headline</span>
              <UiInput className={inp} value={visual.quoteCardHeadline} onChange={(e) => updateVisual({ quoteCardHeadline: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Quote card — attribution</span>
              <UiInput className={inp} value={visual.quoteCardAttribution} onChange={(e) => updateVisual({ quoteCardAttribution: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Thumbnail concept</span>
              <UiTextarea className={cn("min-h-[72px] text-sm", inp)} value={visual.thumbnailConcept} onChange={(e) => updateVisual({ thumbnailConcept: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Flyer concept</span>
              <UiTextarea className={cn("min-h-[72px] text-sm", inp)} value={visual.flyerConcept} onChange={(e) => updateVisual({ flyerConcept: e.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <span className={lab}>Before / after (edit direction)</span>
              <UiTextarea className={cn("min-h-[64px] text-sm", inp)} value={visual.beforeAfterNotes} onChange={(e) => updateVisual({ beforeAfterNotes: e.target.value })} />
            </div>
          </div>
          <div>
            <span className={lab}>Generated concepts (placeholders after API)</span>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {visual.generatedPlaceholders.map((g) => (
                <div key={g.id} className="flex aspect-[4/3] items-end rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/80 p-2 text-xs text-slate-500">
                  {g.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <UiButton size="sm" disabled={actionPending} onClick={() => void runBackendAction("visualsGeneratePrompts", "Generate visual prompts", { kind: "concepts" })}>
              <Sparkles className="h-3.5 w-3.5" />
              Generate prompts
            </UiButton>
            <UiButton size="sm" variant="outline" onClick={() => void runBackendAction("visualsGenerateImages", "Generate images (quote / thumbnail / flyer)")}>
              Generate images
            </UiButton>
            <UiButton
              size="sm"
              variant="outline"
              onClick={() => void runBackendAction("packageCreateTasks", "Export to designer / asset task", { pack: "media_production" })}
              title="task_package (CampaignTask or external ticket via API)"
            >
              Export to asset task
            </UiButton>
          </div>
        </div>
      </TabShell>

      <TabShell id="video" active={activeTab}>
        <div className="space-y-3">
          <p className="text-xs text-amber-900/80">
            <strong>Rendering</strong> is not done in-browser. This panel tracks transcript, <strong>AI edit instructions</strong>, and handoff to your editor / render service.
          </p>
          {firstVideoRef || videoLinked.length > 0 ? (
            <div className={sec}>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Video className="h-3.5 w-3.5" />
                Clip / source (linked)
              </div>
              <ul className="space-y-2 text-xs">
                {(videoLinked.length > 0 ? videoLinked : linkedMedia.slice(0, 1)).map((r) => (
                  <li key={r.refId} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200/80 bg-white p-2">
                    <div className="h-10 w-14 overflow-hidden rounded bg-slate-900/90">
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-white/90">{socialEnumLabel(r.media.kind)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{r.media.title}</div>
                      <div className="text-[10px] text-slate-500">
                        {r.media.fileName} · {r.media.hasTranscript ? "transcript on file" : "no transcript"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={sec}>
            <div className="mb-1 text-xs font-bold text-slate-800">Transcript-scoped actions</div>
            <p className="mb-2 text-[10px] text-slate-500">
              Choose which linked asset feeds quote extraction, cut plans, and captions. Actions POST to Author Studio with <code className="rounded bg-slate-100 px-0.5">ownedMediaId</code> in context.
            </p>
            {linkedMedia.length > 0 ? (
              <div className="mb-2">
                <span className={lab}>Linked asset for AI</span>
                <NativeSelect
                  className="mt-0.5 rounded-lg"
                  value={transcriptRefId || mediaForTranscript[0]?.refId || ""}
                  onValueChange={(v) => setTranscriptRefId(v)}
                  options={mediaForTranscript.map((r) => ({
                    value: r.refId,
                    label: `${r.media.title.slice(0, 48)}${r.media.title.length > 48 ? "…" : ""} — ${r.media.hasTranscript ? "transcript" : "no TS"}`,
                  }))}
                  aria-label="Linked asset for transcript tools"
                />
              </div>
            ) : null}
            {mediaTaskMsg ? <p className="mb-1 text-xs text-amber-900">{mediaTaskMsg}</p> : null}
            <div className="flex flex-wrap gap-1.5">
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending || !selectedTranscriptRef}
                onClick={() => runTranscriptRoute("Extract quote candidates", "videoAnalyzeTranscript", "extract_quotes")}
                title="POST video/analyze-transcript"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Quote candidates
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending || !selectedTranscriptRef}
                onClick={() => {
                  const p = transcriptPayload("hooks_from_transcript");
                  if (!p) {
                    setMediaTaskMsg("No linked media to scope this action.");
                    return;
                  }
                  setMediaTaskMsg(null);
                  void runBackendAction("composeDraft", "Hooks from transcript", p, "preview");
                }}
                title="Uses compose/draft with string intent + ownedMediaId (rewrite route uses a fixed intent enum)"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Hooks
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending || !selectedTranscriptRef}
                onClick={() => runTranscriptRoute("Short clip plan", "videoBuildCutPlan", "short_clip_plan")}
              >
                <GanttChart className="h-3.5 w-3.5" />
                Clip plan
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending || !selectedTranscriptRef}
                onClick={() => runTranscriptRoute("Generate captions", "videoGenerateCaptions", "generate_captions")}
              >
                <Subtitles className="h-3.5 w-3.5" />
                Captions
              </UiButton>
              <UiButton
                size="sm"
                variant="outline"
                disabled={actionPending || !selectedTranscriptRef}
                onClick={() => {
                  const p = transcriptPayload("recap_from_transcript");
                  if (!p) {
                    setMediaTaskMsg("No linked media to scope this action.");
                    return;
                  }
                  setMediaTaskMsg(null);
                  void runBackendAction("packageCreateTasks", "Recap package (transcript-scoped)", { pack: "media_production", ...p }, "apply");
                }}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Recap package
              </UiButton>
            </div>
            <div className="mt-3 border-t border-slate-200/80 pt-2">
              <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">Campaign task presets (from linked media)</div>
              <div className="flex flex-wrap gap-1.5">
                <UiButton size="sm" className="h-7 text-[10px]" disabled={mediaTaskPending} onClick={() => runMediaTaskPreset("media_edit")}>
                  Media edit
                </UiButton>
                <UiButton size="sm" className="h-7 text-[10px]" variant="outline" disabled={mediaTaskPending} onClick={() => runMediaTaskPreset("thumbnail_graphic")}>
                  Thumbnail / graphic
                </UiButton>
                <UiButton size="sm" className="h-7 text-[10px]" variant="outline" disabled={mediaTaskPending} onClick={() => runMediaTaskPreset("captions")}>
                  Captions task
                </UiButton>
                <UiButton size="sm" className="h-7 text-[10px]" variant="outline" disabled={mediaTaskPending} onClick={() => runMediaTaskPreset("clip_review")}>
                  Clip review
                </UiButton>
                <UiButton size="sm" className="h-7 text-[10px]" variant="outline" disabled={mediaTaskPending} onClick={() => runMediaTaskPreset("recap_package")}>
                  Recap task pack
                </UiButton>
              </div>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <span className={lab}>Transcript</span>
              <UiTextarea className={cn("min-h-[140px] font-mono text-xs", inp)} value={video.transcript} onChange={(e) => updateVideo({ transcript: e.target.value })} />
            </div>
            <div>
              <span className={lab}>Source clip (label / ref)</span>
              <UiInput className={inp} value={video.sourceClipLabel} onChange={(e) => updateVideo({ sourceClipLabel: e.target.value })} />
              <div className="mt-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">Upload via Owned Media / asset pipeline (placeholder)</div>
            </div>
            <div>
              <span className={lab}>Clip suggestions</span>
              <ul className="list-inside list-disc text-sm text-slate-600">
                {video.clipSuggestions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className={lab}>Packaging target</span>
              <NativeSelect
                value={video.packaging ?? "tiktok"}
                onValueChange={(v) => updateVideo({ packaging: v as typeof video.packaging })}
                className="rounded-lg"
                options={[
                  { value: "tiktok", label: "TikTok" },
                  { value: "reels", label: "Reels" },
                  { value: "shorts", label: "YouTube Shorts" },
                  { value: "x_video", label: "X video" },
                  { value: "long", label: "Long form" },
                ]}
                aria-label="Packaging"
              />
            </div>
            {(
              [
                ["hooks", "Hooks", video.hooks, (s: string) => updateVideo({ hooks: s })] as const,
                ["cold", "Cold open", video.coldOpen, (s: string) => updateVideo({ coldOpen: s })] as const,
                ["sub", "Subtitles", video.subtitles, (s: string) => updateVideo({ subtitles: s })] as const,
                ["lt", "Lower third", video.lowerThird, (s: string) => updateVideo({ lowerThird: s })] as const,
                ["br", "B-roll ideas", video.broll, (s: string) => updateVideo({ broll: s })] as const,
                ["cut", "Cut / shot plan", video.cutPlan, (s: string) => updateVideo({ cutPlan: s })] as const,
              ] as const
            ).map(([k, la, val, on]) => (
              <div key={k} className="lg:col-span-1">
                <span className={lab}>{la}</span>
                <UiTextarea className={cn("min-h-[72px] text-sm", inp)} value={val} onChange={(e) => on(e.target.value)} />
              </div>
            ))}
            <div className="lg:col-span-2">
              <span className={lab}>Edit-instruction memo (for editor / NLE or render job)</span>
              <UiTextarea className={cn("min-h-[88px] text-sm", inp)} value={video.editInstructionMemo} onChange={(e) => updateVideo({ editInstructionMemo: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <UiButton
              disabled={actionPending || !selectedTranscriptRef}
              onClick={() => runTranscriptRoute("Analyze transcript (full)", "videoAnalyzeTranscript", "full_analyze")}
              size="sm"
            >
              Analyze transcript
            </UiButton>
            <UiButton
              disabled={actionPending || !selectedTranscriptRef}
              onClick={() => runTranscriptRoute("Build cut plan", "videoBuildCutPlan", "editor_cut_plan")}
              size="sm"
              variant="outline"
            >
              <GanttChart className="h-4 w-4" />
              Cut plan
            </UiButton>
            <UiButton
              disabled={actionPending || !selectedTranscriptRef}
              onClick={() => runTranscriptRoute("Generate captions (full)", "videoGenerateCaptions", "full_captions")}
              size="sm"
              variant="outline"
            >
              Captions
            </UiButton>
          </div>
        </div>
      </TabShell>

      <TabShell id="pack" active={activeTab}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Maps to <code className="text-[10px]">SocialPlatformVariant</code>. Use the actions below to save master copy, then build rows and upsert per-platform variant text in the database.
          </p>
          <div className="flex flex-wrap gap-2">
            <UiButton
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={actionPending}
              onClick={() => void applyMasterToWorkItem(compose.master)}
            >
              <Pin className="h-3.5 w-3.5" />
              Apply to master copy
            </UiButton>
            <UiButton
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction("transformPlatformPack", "Preview platform pack from master", { master: compose.master, intent: "from_platform_pack_ui" }, "preview")
              }
            >
              Preview pack
            </UiButton>
            <UiButton
              size="sm"
              className="text-xs"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction("transformPlatformPack", "Create / replace platform variant copy", {
                  master: compose.master,
                  intent: "from_platform_pack_ui",
                  onlyCreateMissingVariants: false,
                }, "apply")
              }
              title="Upsert SocialPlatformVariant copy per default networks (replaces text on existing rows)"
            >
              <Layers3 className="h-3.5 w-3.5" />
              Replace platform variants
            </UiButton>
            <UiButton
              size="sm"
              className="text-xs"
              variant="outline"
              disabled={actionPending}
              onClick={() =>
                void runBackendAction("transformPlatformPack", "Create missing platform variants", {
                  master: compose.master,
                  intent: "from_platform_pack_ui",
                  onlyCreateMissingVariants: true,
                }, "apply")
              }
              title="Only creates new platform rows; does not change copy on existing variants"
            >
              Create platform variants
            </UiButton>
          </div>
          <div className="space-y-4">
            {platformPack.map((p) => (
              <Card key={p.id} className="rounded-2xl border-slate-200">
                <CardHeader className="py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{p.platform}</CardTitle>
                    <UiBadge
                      className={
                        p.readiness === "ready"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : p.readiness === "scheduled"
                            ? "border-slate-800 bg-slate-900 text-white"
                            : "border-amber-200 bg-amber-50 text-amber-900"
                      }
                    >
                      {p.readiness}
                    </UiBadge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className={lab}>Target account</span>
                    <UiInput className={inp} value={p.targetAccount} onChange={(e) => updatePlatformPack(p.id, { targetAccount: e.target.value })} />
                  </div>
                  <div>
                    <span className={lab}>Schedule</span>
                    <UiInput className={inp} type="datetime-local" value={p.scheduleAt} onChange={(e) => updatePlatformPack(p.id, { scheduleAt: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={lab}>Objective</span>
                    <UiInput className={inp} value={p.objective} onChange={(e) => updatePlatformPack(p.id, { objective: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={lab}>Copy</span>
                    <UiTextarea className={cn("min-h-[90px] text-sm", inp)} value={p.copy} onChange={(e) => updatePlatformPack(p.id, { copy: e.target.value })} />
                  </div>
                  <div>
                    <span className={lab}>CTA</span>
                    <UiInput className={inp} value={p.cta} onChange={(e) => updatePlatformPack(p.id, { cta: e.target.value })} />
                  </div>
                  <div>
                    <span className={lab}>Hashtags</span>
                    <UiInput className={inp} value={p.hashtags} onChange={(e) => updatePlatformPack(p.id, { hashtags: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={lab}>Asset slot (reference)</span>
                    <UiInput className={inp} value={p.assetNote} onChange={(e) => updatePlatformPack(p.id, { assetNote: e.target.value })} />
                  </div>
                  {socialContentItemId && linkedMedia.length > 0 ? (
                    <div className="sm:col-span-2 rounded-lg border border-slate-200/80 bg-slate-50/50 p-2">
                      <span className={lab}>Linked media for this variant</span>
                      <p className="mb-1 text-[10px] text-slate-500">
                        Sets a ref to <code className="rounded bg-white px-0.5 text-[9px]">PLATFORM_VARIANT</code> for this <code className="rounded bg-white px-0.5 text-[9px]">SocialPlatformVariant</code> id. Unapproved assets require a confirmation step.
                        {platformVariants.length > 0 && !platformVariants.some((v) => v.id === p.id) ? (
                          <span className="ml-1 font-medium text-amber-800"> This card’s id may be local-only until you sync from the work item.</span>
                        ) : null}
                      </p>
                      <NativeSelect
                        className="rounded-lg"
                        value={linkedMedia.find((r) => r.socialPlatformVariantId === p.id)?.refId ?? ""}
                        options={[
                          { value: "", label: "— Not assigned —" },
                          ...linkedMedia.map((r) => ({
                            value: r.refId,
                            label: `${r.media.title.slice(0, 36)}${r.media.title.length > 36 ? "…" : ""}${!r.media.approvedForSocial ? " (unapproved)" : ""}`,
                          })),
                        ]}
                        onValueChange={(refId) => {
                          if (!refId) return;
                          assignRefToVariant(refId, p.id);
                        }}
                        aria-label="Assign linked media to this platform variant"
                      />
                    </div>
                  ) : null}
                  <div className="sm:col-span-2">
                    <span className={lab}>Platform notes (hashtags, thread plan)</span>
                    <UiTextarea className={cn("min-h-[48px] text-sm", inp)} value={p.notes} onChange={(e) => updatePlatformPack(p.id, { notes: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-1 sm:col-span-2">
                    <UiButton
                      size="sm"
                      variant="outline"
                      onClick={() => void runBackendAction("transformPlatformPack", "Save pack row", { intent: "save_row", platformVariantId: p.id })}
                    >
                      Save
                    </UiButton>
                    <UiButton
                      size="sm"
                      onClick={() => void runBackendAction("packageExport", "Schedule this variant", { intent: "schedule", platformVariantId: p.id })}
                    >
                      Send to schedule
                    </UiButton>
                    <UiButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPlatformPack([
                          ...platformPack,
                          {
                            ...p,
                            id: `${p.id}-co-${String(Date.now()).slice(-6)}`,
                            platform: `${p.platform} (county)`,
                            readiness: "draft" as const,
                            scheduleAt: "",
                            notes: "County duplicate (local) — TODO: transformPlatformPack to persist",
                          },
                        ]);
                      }}
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                      County duplicate
                    </UiButton>
                    <UiButton
                      size="sm"
                      variant="ghost"
                      onClick={() => void runBackendAction("transformPlatformPack", "Alt hook for platform", { intent: "alt_hook", platformVariantId: p.id })}
                    >
                      Alt hook
                    </UiButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabShell>

      <TabShell id="export" active={activeTab}>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500">Approval checklist</h4>
              <ul className="mt-2 space-y-1.5">
                {approval.checklist.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.done} onChange={() => toggleChecklist(c.id)} />
                      {c.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500">Links (CampaignOS)</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Event: {approval.linkedEvent}</li>
                <li>Intake: {approval.linkedIntake}</li>
                <li>
                  Tasks: {approval.linkedTasks.map((t) => t.label).join(", ")}
                </li>
                <li>
                  Assets: {approval.linkedAssets.map((a) => a.label).join(", ")}
                </li>
              </ul>
            </div>
          </div>
          <div>
            <span className={lab}>Export package notes</span>
            <UiTextarea className={cn("min-h-[72px]", inp)} value={approval.exportNotes} onChange={(e) => updateApproval({ exportNotes: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <UiButton
              variant="outline"
              onClick={() => void runBackendAction("packageCreateTasks", "Preview task pack", { pack: "comms_review" }, "preview")}
              disabled={actionPending}
            >
              Preview task pack
            </UiButton>
            <UiButton
              onClick={() => void runBackendAction("packageCreateTasks", "Create task pack", { pack: "comms_review" }, "apply")}
              disabled={actionPending}
            >
              <CheckSquare className="h-4 w-4" />
              Create task pack
            </UiButton>
            <UiButton variant="outline" onClick={() => void runBackendAction("packageExport", "Push to scheduling queue", { intent: "schedule_all" })}>
              <ArrowRightLeft className="h-4 w-4" />
              Push to schedule
            </UiButton>
            <UiButton
              variant="outline"
              onClick={() => void runBackendAction("packageCreateTasks", "Press follow-up task", { pack: "monitor_engagement" })}
            >
              Press follow-up
            </UiButton>
            <UiButton
              variant="outline"
              onClick={() => void runBackendAction("packageCreateTasks", "County variant tasks", { pack: "media_production" })}
            >
              County variant tasks
            </UiButton>
            <UiButton variant="outline" onClick={() => void runBackendAction("packageExport", "Archive final package", { intent: "archive" })}>
              Archive
            </UiButton>
          </div>
        </div>
      </TabShell>
    </>
  );
}
