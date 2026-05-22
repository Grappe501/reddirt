"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MESSAGE_STUDIO_CONTENT_BLOCKS } from "@/components/admin/email-command-center/message-studio-content-blocks";
import {
  createEmptyDraft,
  duplicateDraft,
  loadDraftsFromStorage,
  type MessageStudioApprovalStatus,
  type MessageStudioLocalDraft,
  MESSAGE_STUDIO_DRAFTS_STORAGE_KEY,
  saveDraftsToStorage,
} from "@/components/admin/email-command-center/message-studio-local-drafts";
import { MessageStudioCampaignPanels } from "@/components/admin/email-command-center/MessageStudioCampaignPanels";
import { MessageStudioEditorialReviewPanel } from "@/components/admin/email-command-center/MessageStudioEditorialReviewPanel";
import { MessageStudioProductionTemplatesPanel } from "@/components/admin/email-command-center/MessageStudioProductionTemplatesPanel";
import { MessageStudioSendPacketPanel } from "@/components/admin/email-command-center/MessageStudioSendPacketPanel";
import { MessageStudioSharedDraftsPanel } from "@/components/admin/email-command-center/MessageStudioSharedDraftsPanel";
import type { MessageStudioDraftListRow } from "@/lib/email-command-center/message-studio-drafts";
import { getDefaultCampaignVoiceSettings, getToneProfileById } from "@/lib/email-command-center/campaign-voice";
import {
  defaultEditorialClaimSourceChecklist,
  defaultEditorialComplianceChecklist,
  defaultEditorialVoiceAudienceChecklist,
} from "@/lib/email-command-center/message-studio-editorial-review-model";

const APPROVAL_OPTIONS: { value: MessageStudioApprovalStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "needs_review", label: "Needs review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "ready_for_future_send", label: "Ready for future send (not sent)" },
];

function formatShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function sourceContextFromUrl(props: MessageStudioDraftPlannerProps): MessageStudioLocalDraft["sourceContext"] {
  const { querySource, queryId, queryAudienceDefinitionId, queryImportBatchId } = props;
  return {
    source: querySource ?? "",
    emailWorkflowItemId: querySource === "emailWorkflowItem" ? (queryId ?? "") : "",
    audienceDefinitionId: queryAudienceDefinitionId ?? "",
    importBatchId: queryImportBatchId ?? "",
  };
}

export type MessageStudioDraftPlannerProps = {
  querySource?: string;
  queryId?: string;
  queryAudienceDefinitionId?: string;
  queryImportBatchId?: string;
  /** Server detects OPENAI_API_KEY — no secret exposed to client */
  openaiServerConfigured?: boolean;
  /** Shared Postgres drafts (EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0). */
  serverDraftRows?: MessageStudioDraftListRow[];
};

export function MessageStudioDraftPlanner({
  querySource,
  queryId,
  queryAudienceDefinitionId,
  queryImportBatchId,
  openaiServerConfigured = false,
  serverDraftRows = [],
}: MessageStudioDraftPlannerProps) {
  const [hydrated, setHydrated] = useState(false);
  const [drafts, setDrafts] = useState<MessageStudioLocalDraft[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  /** Passed once into the next Campaign Voice AI generate call (MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0). */
  const [pendingAiTemplateSummary, setPendingAiTemplateSummary] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const urlContext = useMemo(
    () => sourceContextFromUrl({ querySource, queryId, queryAudienceDefinitionId, queryImportBatchId }),
    [querySource, queryId, queryAudienceDefinitionId, queryImportBatchId],
  );

  const activeDraft = drafts.find((d) => d.id === activeId) ?? null;

  const sourceHintsLine = useMemo(() => {
    const parts: string[] = [];
    if (querySource) parts.push(`source=${querySource}`);
    if (queryId) parts.push(`id=${queryId}`);
    if (queryAudienceDefinitionId) parts.push(`audienceDefinitionId=${queryAudienceDefinitionId}`);
    if (queryImportBatchId) parts.push(`importBatchId=${queryImportBatchId}`);
    return parts.join("; ");
  }, [querySource, queryId, queryAudienceDefinitionId, queryImportBatchId]);

  const persist = useCallback((next: MessageStudioLocalDraft[]) => {
    saveDraftsToStorage(next);
    setLastSavedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    const loaded = loadDraftsFromStorage();
    if (loaded.length === 0) {
      const initial = createEmptyDraft({
        title: "Untitled draft",
        sourceContext: urlContext,
      });
      setDrafts([initial]);
      setActiveId(initial.id);
      persist([initial]);
    } else {
      setDrafts(loaded);
      setActiveId(loaded[0]?.id ?? null);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount; URL chips still shown separately
  }, []);

  useEffect(() => {
    if (!hydrated || drafts.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persist(drafts);
    }, 450);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [drafts, hydrated, persist]);

  const patchActiveBase = useCallback(
    (patch: Partial<MessageStudioLocalDraft>) => {
      if (!activeId) return;
      const now = new Date().toISOString();
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.id !== activeId) return d;
          const { sourceContext: scPatch, ...rest } = patch;
          const next: MessageStudioLocalDraft = { ...d, ...rest, updatedAt: now };
          if (scPatch) {
            next.sourceContext = { ...d.sourceContext, ...scPatch };
          }
          return next;
        }),
      );
    },
    [activeId],
  );

  const patchActive = useCallback(
    (patch: Partial<MessageStudioLocalDraft>) => {
      setEditorDirty(true);
      patchActiveBase(patch);
    },
    [patchActiveBase],
  );

  useEffect(() => {
    setEditorDirty(false);
  }, [activeId]);

  const onMergeLoadedLocalDraft = useCallback(
    (loaded: MessageStudioLocalDraft) => {
      setEditorDirty(false);
      setDrafts((prev) => prev.map((d) => (d.id === activeId ? loaded : d)));
      setActiveId(loaded.id);
    },
    [activeId],
  );

  const onAttachLinkedServerId = useCallback(
    (serverDraftId: string) => {
      setEditorDirty(false);
      patchActiveBase({ linkedServerDraftId: serverDraftId });
    },
    [patchActiveBase],
  );

  const handleNewDraft = () => {
    const d = createEmptyDraft({
      title: "Untitled draft",
      sourceContext: { ...urlContext },
    });
    setDrafts((prev) => [...prev, d]);
    setActiveId(d.id);
  };

  const handleDuplicate = () => {
    if (!activeDraft) return;
    const d = duplicateDraft(activeDraft);
    setDrafts((prev) => [...prev, d]);
    setActiveId(d.id);
  };

  const handleDelete = () => {
    if (!activeId || drafts.length === 0) return;
    const next = drafts.filter((d) => d.id !== activeId);
    if (next.length === 0) {
      const fresh = createEmptyDraft({ title: "Untitled draft", sourceContext: { ...urlContext } });
      setDrafts([fresh]);
      setActiveId(fresh.id);
    } else {
      setDrafts(next);
      setActiveId(next[0].id);
    }
  };

  const handleSaveNow = () => {
    persist(drafts);
  };

  const handleClearEditor = () => {
    if (!activeId) return;
    const now = new Date().toISOString();
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === activeId
          ? {
              ...d,
              updatedAt: now,
              title: "",
              draftType: "",
              subject: "",
              preheader: "",
              audienceNote: "",
              primaryCta: "",
              approvalStatus: "draft",
              approvalNotes: "",
              complianceNotes: "",
              body: "",
              contentBlocksUsed: [],
              governanceAcknowledged: false,
              sourceContext: { ...d.sourceContext },
              campaignVoice: { ...getDefaultCampaignVoiceSettings() },
              lastAiAdvisoryJson: "",
              qualityChecklist: {},
              approvalOwner: "",
              tone: getToneProfileById(getDefaultCampaignVoiceSettings().toneProfileId)?.label ?? d.tone,
              editorialReviewStatus: "editorial_draft",
              editorialReviewOwner: "operator",
              editorialReviewNotes: "",
              editorialClaimSourceChecklist: defaultEditorialClaimSourceChecklist(),
              editorialVoiceAudienceChecklist: defaultEditorialVoiceAudienceChecklist(),
              editorialComplianceChecklist: defaultEditorialComplianceChecklist(),
              templateIdLastApplied: "",
              templatesUsed: [],
              lastSendPacketJson: "",
              lastSendPacketGeneratedAt: "",
              linkedServerDraftId: undefined,
            }
          : d,
      ),
    );
  };

  const insertBlock = (title: string, body: string) => {
    if (!activeDraft) return;
    const block = `\n\n--- ${title} ---\n${body}\n`;
    const used = activeDraft.contentBlocksUsed.includes(title)
      ? activeDraft.contentBlocksUsed
      : [...activeDraft.contentBlocksUsed, title];
    patchActive({ body: (activeDraft.body + block).trimStart(), contentBlocksUsed: used });
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint(label);
      setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint("Copy failed — browser blocked clipboard");
      setTimeout(() => setCopyHint(null), 2500);
    }
  };

  const downloadBlob = (filename: string, mime: string, text: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!activeDraft) return;
    downloadBlob(
      `message-studio-draft-${activeDraft.id.slice(0, 8)}.json`,
      "application/json",
      JSON.stringify(activeDraft, null, 2),
    );
  };

  const handleExportTxt = () => {
    if (!activeDraft) return;
    const txt = [
      `Title: ${activeDraft.title}`,
      `Type: ${activeDraft.draftType}`,
      `Subject: ${activeDraft.subject}`,
      `Preheader: ${activeDraft.preheader}`,
      `Tone: ${activeDraft.tone}`,
      `Approval owner: ${activeDraft.approvalOwner}`,
      `Approval: ${activeDraft.approvalStatus}`,
      `Editorial review: ${activeDraft.editorialReviewStatus.replace(/_/g, " ")} · owner: ${activeDraft.editorialReviewOwner.replace(/_/g, " ")}`,
      `--- Body ---`,
      activeDraft.body,
    ].join("\n");
    downloadBlob(`message-studio-draft-${activeDraft.id.slice(0, 8)}.txt`, "text/plain", txt);
  };

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 font-body text-[11px] text-kelly-muted">
        Loading local draft library…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-kelly-text/10 pb-2">
        <div>
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Draft workspace (local browser)</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/75">
            LOCAL-DRAFTS-1.1 + CAMPAIGN-VOICE-1.2 + EDITORIAL-REVIEW-DESK-1.0 + PRODUCTION-TEMPLATES-1.0 — autosave to{" "}
            <code className="rounded bg-kelly-page px-0.5 text-[9px]">{MESSAGE_STUDIO_DRAFTS_STORAGE_KEY}</code>.{" "}
            <strong>Not</strong> shared with staff or production. Clearing site data removes drafts.
          </p>
        </div>
        <div className="text-right font-body text-[10px] text-kelly-forest">
          {lastSavedAt ? (
            <>
              <span className="font-bold">Saved locally</span>
              <span className="text-kelly-muted"> · {formatShort(lastSavedAt)}</span>
            </>
          ) : (
            <span className="text-kelly-muted">Autosave on edit</span>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-amber-200/70 bg-amber-50/80 px-2 py-2 font-body text-[10px] text-amber-950">
        <p className="font-semibold">Governance</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>
            Local drafts exist in this browser profile. <strong>Shared drafts</strong> (panel below) live in Postgres for
            all operators — still <strong>no send</strong>.
          </li>
          <li>
            No sends, no SendGrid/Gmail APIs from this page. Optional <strong>admin server</strong> OpenAI drafting runs
            only when <code className="text-[9px]">OPENAI_API_KEY</code> is set — advisory JSON, never auto-sent.
          </li>
          <li>
            After review, use{" "}
            <Link href="/admin/workbench/email-command-center/send-execution" className="font-bold underline">
              Send Execution Governance
            </Link>{" "}
            to verify gates. This page still cannot send.
          </li>
        </ul>
      </div>

      <div id="shared-drafts">
        <MessageStudioSharedDraftsPanel
          initialServerRows={serverDraftRows}
          activeDraft={activeDraft}
          editorDirty={editorDirty}
          onMergeLoadedLocalDraft={onMergeLoadedLocalDraft}
          onAttachLinkedServerId={onAttachLinkedServerId}
        />
      </div>

      {(urlContext.source ||
        urlContext.emailWorkflowItemId ||
        urlContext.audienceDefinitionId ||
        urlContext.importBatchId) && (
        <div className="mt-2 flex flex-wrap gap-1.5" role="status">
          <span className="font-heading text-[9px] font-bold uppercase text-kelly-muted">URL context</span>
          {urlContext.source === "emailWorkflowItem" && queryId ? (
            <span className="rounded border border-kelly-forest/30 bg-emerald-50/80 px-2 py-0.5 text-[9px] font-semibold text-emerald-950">
              From queue item · id <span className="font-mono">{queryId}</span>
            </span>
          ) : null}
          {queryAudienceDefinitionId ? (
            <span className="rounded border border-kelly-navy/25 bg-kelly-fog/70 px-2 py-0.5 text-[9px] font-semibold text-kelly-navy">
              From audience definition · <span className="font-mono">{queryAudienceDefinitionId}</span>
            </span>
          ) : null}
          {queryImportBatchId ? (
            <span className="rounded border border-amber-300/50 bg-amber-50/90 px-2 py-0.5 text-[9px] font-semibold text-amber-950">
              From import batch · <span className="font-mono">{queryImportBatchId}</span>
            </span>
          ) : null}
          {urlContext.source && urlContext.source !== "emailWorkflowItem" ? (
            <span className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-[9px] text-kelly-slate">
              source=<span className="font-mono">{urlContext.source}</span>
            </span>
          ) : null}
        </div>
      )}

      <div className="mt-3 space-y-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(280px,340px)]">
        <aside className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-muted">Draft library</p>
          <p className="mt-1 font-body text-[10px] text-kelly-navy">
            <span className="font-bold tabular-nums">{drafts.length}</span> local draft{drafts.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-2 max-h-[min(360px,50vh)] space-y-1 overflow-y-auto">
            {drafts.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(d.id)}
                  className={`w-full rounded border px-2 py-1.5 text-left text-[10px] transition ${
                    d.id === activeId
                      ? "border-kelly-forest/50 bg-emerald-50/90 font-semibold text-emerald-950"
                      : "border-kelly-text/10 bg-white/90 text-kelly-text/90 hover:border-kelly-forest/30"
                  }`}
                >
                  <span className="line-clamp-2">{d.title.trim() || "Untitled"}</span>
                  <span className="mt-0.5 block text-[9px] text-kelly-muted">
                    {formatShort(d.updatedAt)} · {d.draftType || "—"} · {d.approvalStatus.replace(/_/g, " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 space-y-2 xl:col-span-1">
          {activeDraft ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleNewDraft}
                  className="rounded border border-kelly-forest/40 bg-kelly-fog/70 px-2 py-1 text-[10px] font-bold text-kelly-navy"
                >
                  New draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveNow}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Save locally
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Duplicate draft
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded border border-rose-300/60 bg-rose-50/80 px-2 py-1 text-[10px] font-semibold text-rose-950"
                >
                  Delete draft
                </button>
                <button
                  type="button"
                  onClick={() => copyText("Body", activeDraft.body)}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Copy body
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText("Subject + body", `${activeDraft.subject}\n\n${activeDraft.body}`.trim())
                  }
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Copy subject + body
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Export .txt
                </button>
                <button
                  type="button"
                  onClick={handleClearEditor}
                  className="rounded border border-kelly-text/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-slate"
                >
                  Clear editor
                </button>
              </div>
              {copyHint ? (
                <p className="text-[10px] font-semibold text-kelly-forest" role="status">
                  {copyHint}
                </p>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Title
                  <input
                    value={activeDraft.title}
                    onChange={(e) => patchActive({ title: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                    placeholder="Internal name for this draft"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80">
                  Draft type
                  <input
                    value={activeDraft.draftType}
                    onChange={(e) => patchActive({ draftType: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                    placeholder="e.g. Volunteer follow-up"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80">
                  Voice tone (from Campaign Voice profile)
                  <input
                    readOnly
                    value={activeDraft.tone}
                    className="mt-0.5 w-full cursor-not-allowed rounded border border-kelly-text/10 bg-kelly-page/50 px-2 py-1 text-[11px] text-kelly-muted"
                    title="Change tone in the Campaign Voice panel"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Subject
                  <input
                    value={activeDraft.subject}
                    onChange={(e) => patchActive({ subject: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Preheader
                  <input
                    value={activeDraft.preheader}
                    onChange={(e) => patchActive({ preheader: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Audience / context note
                  <textarea
                    value={activeDraft.audienceNote}
                    onChange={(e) => patchActive({ audienceNote: e.target.value })}
                    rows={2}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Primary CTA
                  <input
                    value={activeDraft.primaryCta}
                    onChange={(e) => patchActive({ primaryCta: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80">
                  Approval status
                  <select
                    value={activeDraft.approvalStatus}
                    onChange={(e) =>
                      patchActive({ approvalStatus: e.target.value as MessageStudioApprovalStatus })
                    }
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  >
                    {APPROVAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] text-kelly-text/80">
                  Approval owner (name / role)
                  <input
                    value={activeDraft.approvalOwner}
                    onChange={(e) => patchActive({ approvalOwner: e.target.value })}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                    placeholder="e.g. Comms lead — J."
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Approval notes
                  <textarea
                    value={activeDraft.approvalNotes}
                    onChange={(e) => patchActive({ approvalNotes: e.target.value })}
                    rows={2}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Compliance / source notes
                  <textarea
                    value={activeDraft.complianceNotes}
                    onChange={(e) => patchActive({ complianceNotes: e.target.value })}
                    rows={2}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
                  />
                </label>
                <fieldset className="sm:col-span-2 rounded border border-kelly-text/10 px-2 py-2">
                  <legend className="px-1 text-[9px] font-bold uppercase text-kelly-muted">Source context (editable)</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-[10px] text-kelly-text/80">
                      source
                      <input
                        value={activeDraft.sourceContext.source}
                        onChange={(e) =>
                          patchActive({ sourceContext: { ...activeDraft.sourceContext, source: e.target.value } })
                        }
                        className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px] font-mono"
                      />
                    </label>
                    <label className="text-[10px] text-kelly-text/80">
                      emailWorkflowItemId
                      <input
                        value={activeDraft.sourceContext.emailWorkflowItemId}
                        onChange={(e) =>
                          patchActive({
                            sourceContext: { ...activeDraft.sourceContext, emailWorkflowItemId: e.target.value },
                          })
                        }
                        className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px] font-mono"
                      />
                    </label>
                    <label className="text-[10px] text-kelly-text/80">
                      audienceDefinitionId
                      <input
                        value={activeDraft.sourceContext.audienceDefinitionId}
                        onChange={(e) =>
                          patchActive({
                            sourceContext: { ...activeDraft.sourceContext, audienceDefinitionId: e.target.value },
                          })
                        }
                        className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px] font-mono"
                      />
                    </label>
                    <label className="text-[10px] text-kelly-text/80">
                      importBatchId
                      <input
                        value={activeDraft.sourceContext.importBatchId}
                        onChange={(e) =>
                          patchActive({
                            sourceContext: { ...activeDraft.sourceContext, importBatchId: e.target.value },
                          })
                        }
                        className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px] font-mono"
                      />
                    </label>
                  </div>
                </fieldset>
                <label className="flex cursor-pointer items-start gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={activeDraft.governanceAcknowledged}
                    onChange={(e) => patchActive({ governanceAcknowledged: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-[10px] text-kelly-text/85">
                    I understand these drafts are stored only in this browser, are not sent, and are not shared with the team
                    until a future server persistence packet.
                  </span>
                </label>
                <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
                  Body
                  <textarea
                    value={activeDraft.body}
                    onChange={(e) => patchActive({ body: e.target.value })}
                    rows={12}
                    className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 font-mono text-[11px] leading-relaxed"
                    placeholder="Message body — no auto-fetch from Gmail or queue."
                  />
                </label>
                {activeDraft.contentBlocksUsed.length > 0 ? (
                  <p className="sm:col-span-2 text-[10px] text-kelly-muted">
                    Blocks used in this draft:{" "}
                    <span className="font-semibold text-kelly-navy">{activeDraft.contentBlocksUsed.join(", ")}</span>
                  </p>
                ) : null}
              </div>

              <div className="rounded border border-kelly-text/10 bg-kelly-page/30 p-2">
                <p className="font-heading text-[10px] font-bold uppercase text-kelly-muted">Content blocks</p>
                <p className="mt-1 text-[9px] text-kelly-muted">Insert appends to body; Copy puts block text on clipboard.</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {MESSAGE_STUDIO_CONTENT_BLOCKS.map((b) => (
                    <li key={b.title} className="rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5">
                      <p className="font-semibold text-kelly-navy text-[11px]">{b.title}</p>
                      <p className="mt-0.5 text-[10px] text-kelly-text/80">{b.body}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => insertBlock(b.title, b.body)}
                          className="rounded border border-kelly-forest/35 bg-emerald-50/70 px-2 py-0.5 text-[9px] font-bold text-emerald-950"
                        >
                          Insert into body
                        </button>
                        <button
                          type="button"
                          onClick={() => copyText(`Block: ${b.title}`, b.body)}
                          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-[9px] font-semibold text-kelly-slate"
                        >
                          Copy block
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-kelly-muted">Select or create a draft.</p>
          )}
        </div>

        {activeDraft ? (
          <div className="min-w-0 space-y-2 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
            <MessageStudioCampaignPanels
              activeDraft={activeDraft}
              patchActive={patchActive}
              openaiServerConfigured={openaiServerConfigured}
              sourceHintsLine={sourceHintsLine}
              templateSummaryForAi={pendingAiTemplateSummary}
              onAiGenerateConsumed={() => setPendingAiTemplateSummary(null)}
            />
          </div>
        ) : null}
      </div>

      {activeDraft ? (
        <MessageStudioEditorialReviewPanel
          activeDraft={activeDraft}
          patchActive={patchActive}
          openaiServerConfigured={openaiServerConfigured}
        />
      ) : null}

      {activeDraft ? (
        <MessageStudioSendPacketPanel activeDraft={activeDraft} patchActive={patchActive} copyText={copyText} />
      ) : null}

      {activeDraft ? (
        <MessageStudioProductionTemplatesPanel
          activeDraft={activeDraft}
          patchActive={patchActive}
          openaiServerConfigured={openaiServerConfigured}
          onQueueTemplateForAi={(summary) => setPendingAiTemplateSummary(summary)}
          pendingAiTemplateSummary={pendingAiTemplateSummary}
          copyText={copyText}
        />
      ) : null}
      </div>
    </div>
  );
}
