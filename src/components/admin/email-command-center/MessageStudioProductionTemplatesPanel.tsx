"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import type { MessageStudioApprovalStatus } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { getToneProfileById, ISSUE_FRAMES, TONE_PROFILES } from "@/lib/email-command-center/campaign-voice";
import {
  buildTemplateOutlineText,
  buildTemplateSummaryForAi,
  filterTemplates,
  getTemplateById,
  mapTemplateRiskToCampaignVoice,
  MESSAGE_STUDIO_AUDIENCE_FILTER_TAGS,
  MESSAGE_STUDIO_EMAIL_TEMPLATES,
  MESSAGE_TEMPLATE_CATEGORY_LABELS,
  MESSAGE_TEMPLATE_CATEGORIES,
  recordTemplateUse,
  type MessageStudioEmailTemplate,
  type MessageTemplateCategory,
} from "@/lib/email-command-center/message-templates";
type ApplyMode = "empty_only" | "append_body" | "replace_body";

type Props = {
  activeDraft: MessageStudioLocalDraft;
  patchActive: (patch: Partial<MessageStudioLocalDraft>) => void;
  openaiServerConfigured: boolean;
  onQueueTemplateForAi: (summary: string) => void;
  pendingAiTemplateSummary: string | null;
  copyText: (label: string, text: string) => void | Promise<void>;
};

function buildApplyPatch(
  d: MessageStudioLocalDraft,
  t: MessageStudioEmailTemplate,
  mode: ApplyMode,
  replaceConfirmed: boolean,
): Partial<MessageStudioLocalDraft> | { error: string } {
  const hasBody = d.body.trim().length > 0;
  if (mode === "replace_body" && hasBody && !replaceConfirmed) {
    return { error: "Check “I confirm replacing body” or pick empty-only / append." };
  }

  const firstIssue = t.recommendedIssueFrameIds[0] ?? d.campaignVoice.issueFrameId;
  const nextCv = {
    ...d.campaignVoice,
    toneProfileId: t.recommendedToneProfileId,
    issueFrameId: firstIssue,
    audienceFrameId: t.recommendedAudienceFrameId,
    ctaFrameId: t.recommendedCtaFrameId,
    riskLevel: mapTemplateRiskToCampaignVoice(t.riskLevel),
    approvalLevel: t.approvalLevel,
  };
  const toneLabel = getToneProfileById(nextCv.toneProfileId)?.label ?? d.tone;

  const subPat = t.subjectPatterns[0] ?? "";
  const prePat = t.preheaderPatterns[0] ?? "";
  let subject = d.subject;
  let preheader = d.preheader;
  let body = d.body;
  const appendBlock = `\n\n--- From template: ${t.label} (${t.id}) ---\n${t.bodyStructure}`;

  if (mode === "empty_only") {
    if (!subject.trim()) subject = subPat;
    if (!preheader.trim()) preheader = prePat;
    if (!body.trim()) body = t.bodyStructure;
  } else if (mode === "append_body") {
    if (!subject.trim()) subject = subPat;
    if (!preheader.trim()) preheader = prePat;
    body = d.body.trim() ? `${d.body.trim()}${appendBlock}` : t.bodyStructure;
  } else {
    body = t.bodyStructure;
    subject = subPat || d.subject;
    preheader = prePat || d.preheader;
  }

  const primaryCta = !d.primaryCta.trim() && t.ctaOptions[0] ? t.ctaOptions[0] : d.primaryCta;
  const draftType = !d.draftType.trim() ? t.label : d.draftType;

  const tmplCompliance = `--- Template compliance (${t.id}) ---\n${t.complianceNotes}`;
  const complianceNotes = d.complianceNotes.trim()
    ? `${d.complianceNotes.trim()}\n\n${tmplCompliance}`
    : tmplCompliance;

  const tmplReview = `--- Template review (${t.id}) — risk ${t.riskLevel}, approver track ${t.approvalLevel} ---\n${t.reviewNotes}`;
  const editorialReviewNotes = d.editorialReviewNotes.trim()
    ? `${d.editorialReviewNotes.trim()}\n\n${tmplReview}`
    : tmplReview;

  const approvalStatus: MessageStudioApprovalStatus = "needs_review";

  return {
    draftType,
    subject,
    preheader,
    body,
    primaryCta,
    campaignVoice: nextCv,
    tone: toneLabel,
    complianceNotes,
    editorialReviewNotes,
    editorialReviewOwner: t.suggestedEditorialReviewOwner,
    approvalStatus,
    editorialReviewStatus: "editorial_needs_edits",
    templateIdLastApplied: t.id,
    templatesUsed: recordTemplateUse(d.templatesUsed, t.id),
  };
}

export function MessageStudioProductionTemplatesPanel({
  activeDraft,
  patchActive,
  openaiServerConfigured,
  onQueueTemplateForAi,
  pendingAiTemplateSummary,
  copyText,
}: Props) {
  const [category, setCategory] = useState<MessageTemplateCategory | "all">("all");
  const [audienceTag, setAudienceTag] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(MESSAGE_STUDIO_EMAIL_TEMPLATES[0]?.id ?? null);
  const [applyMode, setApplyMode] = useState<ApplyMode>("empty_only");
  const [replaceBodyConfirmed, setReplaceBodyConfirmed] = useState(false);
  const [replaceMetaConfirmed, setReplaceMetaConfirmed] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterTemplates(MESSAGE_STUDIO_EMAIL_TEMPLATES, category, audienceTag),
    [category, audienceTag],
  );

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((f) => f.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = selectedId ? getTemplateById(selectedId) : undefined;

  const toneLabelFor = (tid: string) => TONE_PROFILES.find((x) => x.id === tid)?.label ?? tid;
  const issueLabelsFor = (ids: string[]) =>
    ids.map((id) => ISSUE_FRAMES.find((f) => f.id === id)?.label ?? id).join(" · ");

  const handleApply = () => {
    setApplyMessage(null);
    if (!selected) return;
    const patch = buildApplyPatch(activeDraft, selected, applyMode, replaceBodyConfirmed);
    if ("error" in patch) {
      setApplyMessage(patch.error);
      return;
    }
    patchActive(patch);
    setApplyMessage(`Applied “${selected.label}” (${applyMode.replace(/_/g, " ")}).`);
  };

  const fillEmptyMeta = () => {
    if (!selected) return;
    const sub = selected.subjectPatterns[0] ?? "";
    const pre = selected.preheaderPatterns[0] ?? "";
    patchActive({
      subject: activeDraft.subject.trim() ? activeDraft.subject : sub,
      preheader: activeDraft.preheader.trim() ? activeDraft.preheader : pre,
      templateIdLastApplied: selected.id,
      templatesUsed: recordTemplateUse(activeDraft.templatesUsed, selected.id),
    });
    setApplyMessage("Filled empty subject / preheader from template.");
  };

  const replaceMeta = () => {
    if (!selected) return;
    const hasMeta = activeDraft.subject.trim() || activeDraft.preheader.trim();
    if (hasMeta && !replaceMetaConfirmed) {
      setApplyMessage("Confirm “Replace subject & preheader” to overwrite existing values.");
      return;
    }
    const sub = selected.subjectPatterns[0] ?? "";
    const pre = selected.preheaderPatterns[0] ?? "";
    patchActive({
      subject: sub,
      preheader: pre,
      templateIdLastApplied: selected.id,
      templatesUsed: recordTemplateUse(activeDraft.templatesUsed, selected.id),
    });
    setApplyMessage("Replaced subject / preheader from template.");
  };

  const appendSkeletonOnly = () => {
    if (!selected) return;
    const appendBlock = `\n\n--- From template: ${selected.label} (${selected.id}) ---\n${selected.bodyStructure}`;
    patchActive({
      body: activeDraft.body.trim() ? `${activeDraft.body.trim()}${appendBlock}` : selected.bodyStructure,
      templateIdLastApplied: selected.id,
      templatesUsed: recordTemplateUse(activeDraft.templatesUsed, selected.id),
    });
    setApplyMessage("Appended body skeleton (existing body preserved).");
  };

  const queueForAi = () => {
    if (!selected) return;
    onQueueTemplateForAi(buildTemplateSummaryForAi(selected));
    setApplyMessage("Template structure queued for the next “Generate campaign-voice draft” (Campaign Voice panel).");
  };

  return (
    <section className="rounded-lg border border-violet-200/70 bg-violet-50/40 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-violet-200/60 pb-2">
        <div>
          <h2 className="font-heading text-sm font-bold text-violet-950">Production Templates</h2>
          <p className="mt-1 max-w-3xl font-body text-[10px] text-violet-950/90">
            EMAIL-MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0 — structures and guidance only. Replace placeholders with
            approved copy; no unsourced claims. <strong>No send</strong>, <strong>no DB</strong>,{" "}
            <strong>no demo mode</strong> — stored on this draft in{" "}
            <code className="rounded bg-white/90 px-0.5 text-[9px]">localStorage</code> with the rest of Message Studio.
          </p>
        </div>
        <Link
          href="/admin/workbench/email-command-center/send-execution"
          className="shrink-0 text-[10px] font-bold text-violet-900 underline"
        >
          Send governance
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <label className="text-[10px] text-violet-950/90">
          Category
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as MessageTemplateCategory | "all");
              setSelectedId(null);
            }}
            className="mt-0.5 block w-52 rounded border border-violet-300/80 bg-white px-2 py-1 text-[11px]"
          >
            <option value="all">All categories</option>
            {MESSAGE_TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {MESSAGE_TEMPLATE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] text-violet-950/90">
          Audience
          <select
            value={audienceTag}
            onChange={(e) => {
              setAudienceTag(e.target.value);
              setSelectedId(null);
            }}
            className="mt-0.5 block w-48 rounded border border-violet-300/80 bg-white px-2 py-1 text-[11px]"
          >
            {MESSAGE_STUDIO_AUDIENCE_FILTER_TAGS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
        <div className="min-w-0">
          <p className="font-heading text-[9px] font-bold uppercase text-violet-900/70">
            {filtered.length} template{filtered.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-1 max-h-[min(280px,40vh)] space-y-1 overflow-y-auto rounded border border-violet-200/60 bg-white/95 p-1">
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full rounded border px-2 py-1.5 text-left text-[10px] transition ${
                    t.id === selectedId
                      ? "border-violet-500/60 bg-violet-100/90 font-semibold text-violet-950"
                      : "border-violet-100 bg-white text-violet-900/90 hover:border-violet-300"
                  }`}
                >
                  <span className="line-clamp-2">{t.label}</span>
                  <span className="mt-0.5 block text-[9px] text-violet-800/75">
                    {MESSAGE_TEMPLATE_CATEGORY_LABELS[t.category]} · risk {t.riskLevel} · {t.approvalLevel.replace(/_/g, " ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 space-y-2 rounded border border-violet-200/70 bg-white/95 p-2 text-[10px] text-violet-950">
          {selected ? (
            <>
              <p className="font-bold text-violet-950">{selected.label}</p>
              <p className="text-[9px] text-violet-900/85">{selected.bestFor}</p>
              <dl className="mt-1 grid gap-1 text-[9px]">
                <div>
                  <dt className="font-semibold text-violet-900">Risk</dt>
                  <dd>{selected.riskLevel}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-violet-900">Approval level (voice)</dt>
                  <dd>{selected.approvalLevel.replace(/_/g, " ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-violet-900">Recommended tone</dt>
                  <dd>{toneLabelFor(selected.recommendedToneProfileId)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-violet-900">Issue frames</dt>
                  <dd>{issueLabelsFor(selected.recommendedIssueFrameIds)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-violet-900">Audiences</dt>
                  <dd>{selected.audienceTypes.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-violet-900">Send rail</dt>
                  <dd className="text-violet-900/90">{selected.sendRail}</dd>
                </div>
              </dl>

              <div className="rounded border border-violet-100 bg-violet-50/50 p-2">
                <p className="text-[9px] font-bold uppercase text-violet-900/70">Structure preview</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[9px] leading-snug text-violet-950">
                  {selected.bodyStructure.slice(0, 2800)}
                  {selected.bodyStructure.length > 2800 ? "\n…" : ""}
                </pre>
              </div>

              <div className="rounded border border-amber-200/70 bg-amber-50/80 p-2 text-[9px] text-amber-950">
                <p className="font-bold">Compliance</p>
                <p className="mt-0.5">{selected.complianceNotes}</p>
              </div>
              <div className="rounded border border-slate-200/80 bg-slate-50/90 p-2 text-[9px] text-slate-900">
                <p className="font-bold">Review notes</p>
                <p className="mt-0.5">{selected.reviewNotes}</p>
              </div>
              <div className="rounded border border-slate-200/80 bg-white p-2 text-[9px] text-slate-800">
                <p className="font-bold">Sources required</p>
                <p className="mt-0.5">{selected.sourceRequirements}</p>
              </div>

              <fieldset className="rounded border border-violet-200/60 p-2">
                <legend className="px-1 text-[9px] font-bold uppercase text-violet-900/70">Apply to current draft</legend>
                <p className="text-[9px] text-violet-900/85">
                  Body is never replaced unless you pick “Replace body” and confirm. Full apply also sets Campaign Voice
                  selectors, compliance / review note blocks, approval to <strong>needs review</strong>, and editorial
                  status to <strong>needs edits</strong>.
                </p>
                <div className="mt-2 space-y-1 text-[9px]">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === "empty_only"}
                      onChange={() => setApplyMode("empty_only")}
                    />
                    Fill only empty subject / preheader / body
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === "append_body"}
                      onChange={() => setApplyMode("append_body")}
                    />
                    Append body skeleton below existing body
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="applyMode"
                      checked={applyMode === "replace_body"}
                      onChange={() => setApplyMode("replace_body")}
                    />
                    Replace entire body with skeleton
                  </label>
                </div>
                {applyMode === "replace_body" && activeDraft.body.trim() ? (
                  <label className="mt-2 flex cursor-pointer items-start gap-2 text-[9px]">
                    <input
                      type="checkbox"
                      checked={replaceBodyConfirmed}
                      onChange={(e) => setReplaceBodyConfirmed(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>I confirm replacing the current body (cannot be undone except via browser undo / restore).</span>
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleApply()}
                  className="mt-2 rounded border border-violet-500/50 bg-violet-200/80 px-2 py-1 text-[10px] font-bold text-violet-950"
                >
                  Apply template to draft
                </button>
              </fieldset>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => void copyText("Template outline", buildTemplateOutlineText(selected))}
                  className="rounded border border-violet-300/60 bg-white px-2 py-0.5 text-[9px] font-semibold text-violet-950"
                >
                  Copy template outline
                </button>
                <button
                  type="button"
                  onClick={() => void fillEmptyMeta()}
                  className="rounded border border-violet-300/60 bg-white px-2 py-0.5 text-[9px] font-semibold text-violet-950"
                >
                  Fill empty subject &amp; preheader
                </button>
                <label className="flex cursor-pointer items-center gap-1 text-[9px] text-violet-950">
                  <input
                    type="checkbox"
                    checked={replaceMetaConfirmed}
                    onChange={(e) => setReplaceMetaConfirmed(e.target.checked)}
                  />
                  Allow replace subject / preheader
                </label>
                <button
                  type="button"
                  onClick={() => void replaceMeta()}
                  className="rounded border border-violet-300/60 bg-white px-2 py-0.5 text-[9px] font-semibold text-violet-950"
                >
                  Replace subject &amp; preheader
                </button>
                <button
                  type="button"
                  onClick={() => void appendSkeletonOnly()}
                  className="rounded border border-violet-300/60 bg-white px-2 py-0.5 text-[9px] font-semibold text-violet-950"
                >
                  Append body skeleton only
                </button>
              </div>

              <div className="rounded border border-indigo-200/70 bg-indigo-50/60 p-2">
                <p className="text-[9px] font-bold uppercase text-indigo-950">Campaign Voice AI</p>
                {!openaiServerConfigured ? (
                  <p className="mt-1 text-[9px] text-indigo-950/90">
                    OpenAI is not configured on the server — use template + Campaign Voice controls manually, then run
                    AI when <code className="text-[8px]">OPENAI_API_KEY</code> is available.
                  </p>
                ) : (
                  <p className="mt-1 text-[9px] text-indigo-950/90">
                    Queues this template’s structure for the next <strong>Generate campaign-voice draft</strong> in the
                    Campaign Voice panel (advisory JSON only).
                  </p>
                )}
                <button
                  type="button"
                  disabled={!openaiServerConfigured}
                  onClick={() => void queueForAi()}
                  className="mt-1 rounded border border-indigo-400/50 bg-indigo-100/90 px-2 py-1 text-[9px] font-bold text-indigo-950 disabled:opacity-45"
                >
                  Use this template with Campaign Voice AI
                </button>
                {pendingAiTemplateSummary ? (
                  <p className="mt-1 text-[9px] font-semibold text-indigo-900">
                    A template summary is queued — click Generate in Campaign Voice.
                  </p>
                ) : null}
              </div>

              {applyMessage ? <p className="text-[9px] font-semibold text-violet-900">{applyMessage}</p> : null}
            </>
          ) : (
            <p className="text-[10px] text-violet-800/80">Select a template from the list.</p>
          )}
        </div>
      </div>
    </section>
  );
}
