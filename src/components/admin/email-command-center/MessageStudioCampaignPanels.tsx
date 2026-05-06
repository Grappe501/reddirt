"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AUDIENCE_FRAMES,
  CTA_FRAMES,
  CAMPAIGN_VOICE_PRINCIPLES,
  COMPLIANCE_GUARDRAILS,
  ISSUE_FRAMES,
  MESSAGE_QUALITY_CHECKLIST,
  PROHIBITED_OR_HIGH_RISK_PATTERNS,
  SOURCE_MATERIAL_READINESS,
  TONE_PROFILES,
  type MessageStudioCampaignVoiceSettings,
} from "@/lib/email-command-center/campaign-voice";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  generateCampaignVoiceDraftAction,
  reviseCampaignVoiceDraftAction,
} from "@/app/admin/workbench/email-command-center/message-studio-ai-actions";
import type { CampaignVoiceDraftAiResult, MessageStudioRevisionMode } from "@/lib/email-command-center/message-draft-ai";

const QUALITY_KEYS = [
  "clear_audience",
  "clear_cta",
  "voice_fit",
  "local_relevance",
  "no_unsupported_claim",
  "no_opponent_unsourced",
  "no_accidental_promise",
  "unsub_broadcast",
  "approval_owner",
  "suppression_gate",
] as const;

type MessageStudioCampaignPanelsProps = {
  activeDraft: MessageStudioLocalDraft;
  patchActive: (patch: Partial<MessageStudioLocalDraft>) => void;
  openaiServerConfigured: boolean;
  sourceHintsLine: string;
  /** One-shot template JSON for generate (MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0). */
  templateSummaryForAi?: string | null;
  onAiGenerateConsumed?: () => void;
};

function buildNextCampaignVoice(
  prev: MessageStudioLocalDraft,
  patch: Partial<MessageStudioCampaignVoiceSettings>,
): Partial<MessageStudioLocalDraft> {
  const nextCv: MessageStudioCampaignVoiceSettings = {
    ...prev.campaignVoice,
    ...patch,
    sourceLayers: { ...prev.campaignVoice.sourceLayers, ...patch.sourceLayers },
  };
  const toneLabel = TONE_PROFILES.find((t) => t.id === nextCv.toneProfileId)?.label ?? prev.tone;
  return { campaignVoice: nextCv, tone: toneLabel };
}

function parseAdvisory(json: string): CampaignVoiceDraftAiResult | null {
  if (!json.trim()) return null;
  try {
    return JSON.parse(json) as CampaignVoiceDraftAiResult;
  } catch {
    return null;
  }
}

function readinessLabel(d: MessageStudioLocalDraft): "needs_work" | "review_ready" | "ready_for_future_send_gate" {
  const checks = QUALITY_KEYS.filter((k) => d.qualityChecklist[k] === true).length;
  const hasCore = d.subject.trim().length > 2 && d.body.trim().length > 40 && d.primaryCta.trim().length > 1;
  if (!d.governanceAcknowledged || !hasCore) return "needs_work";
  if (checks >= 8 && d.approvalStatus === "ready_for_future_send") return "ready_for_future_send_gate";
  if (checks >= 5 && hasCore) return "review_ready";
  return "needs_work";
}

export function MessageStudioCampaignPanels({
  activeDraft,
  patchActive,
  openaiServerConfigured,
  sourceHintsLine,
  templateSummaryForAi = null,
  onAiGenerateConsumed,
}: MessageStudioCampaignPanelsProps) {
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [subjectGoal, setSubjectGoal] = useState("");

  const advisory = useMemo(() => parseAdvisory(activeDraft.lastAiAdvisoryJson), [activeDraft.lastAiAdvisoryJson]);
  const tier = readinessLabel(activeDraft);

  const setVoice = useCallback(
    (patch: Partial<MessageStudioCampaignVoiceSettings>) => {
      patchActive(buildNextCampaignVoice(activeDraft, patch));
    },
    [activeDraft, patchActive],
  );

  const toggleLayer = (key: keyof MessageStudioCampaignVoiceSettings["sourceLayers"]) => {
    setVoice({
      sourceLayers: { ...activeDraft.campaignVoice.sourceLayers, [key]: !activeDraft.campaignVoice.sourceLayers[key] },
    });
  };

  const toggleQuality = (key: string) => {
    patchActive({
      qualityChecklist: { ...activeDraft.qualityChecklist, [key]: !activeDraft.qualityChecklist[key] },
    });
  };

  const runGenerate = async () => {
    setAiError(null);
    setAiBusy(true);
    try {
      const res = await generateCampaignVoiceDraftAction({
        draftType: activeDraft.draftType,
        audienceNote: activeDraft.audienceNote,
        subjectGoal: subjectGoal || activeDraft.subject || "(infer from draft)",
        primaryCta: activeDraft.primaryCta,
        complianceNotes: activeDraft.complianceNotes,
        existingBody: activeDraft.body,
        campaignVoice: activeDraft.campaignVoice,
        sourceHints: sourceHintsLine,
        ...(templateSummaryForAi?.trim() ? { templateSummary: templateSummaryForAi.trim() } : {}),
      });
      if (!res.ok) {
        setAiError(res.error);
        return;
      }
      patchActive({ lastAiAdvisoryJson: JSON.stringify(res.result) });
      onAiGenerateConsumed?.();
    } finally {
      setAiBusy(false);
    }
  };

  const runRevise = async (mode: MessageStudioRevisionMode) => {
    setAiError(null);
    setAiBusy(true);
    try {
      const res = await reviseCampaignVoiceDraftAction({
        mode,
        body: activeDraft.body,
        subject: activeDraft.subject,
        audienceNote: activeDraft.audienceNote,
        campaignVoice: activeDraft.campaignVoice,
      });
      if (!res.ok) {
        setAiError(res.error);
        return;
      }
      patchActive({ lastAiAdvisoryJson: JSON.stringify(res.result) });
    } finally {
      setAiBusy(false);
    }
  };

  const applyAdvisoryToDraft = () => {
    if (!advisory) return;
    const subj = advisory.subjectSuggestions[0]?.trim();
    const pre = advisory.preheaderSuggestions[0]?.trim();
    const bod = advisory.emailBodyDraft?.trim();
    const cta0 = advisory.ctaOptions[0]?.trim();
    patchActive({
      ...(subj ? { subject: subj } : {}),
      ...(pre ? { preheader: pre } : {}),
      ...(bod ? { body: bod } : {}),
      ...(cta0 && !activeDraft.primaryCta.trim() ? { primaryCta: cta0 } : {}),
    });
  };

  const revisionButtons: { mode: MessageStudioRevisionMode; label: string }[] = [
    { mode: "warmer", label: "Warmer" },
    { mode: "shorter", label: "Shorter" },
    { mode: "more_urgent", label: "More urgent" },
    { mode: "more_plainspoken", label: "More plainspoken" },
    { mode: "for_volunteers", label: "Volunteers" },
    { mode: "for_donors", label: "Donors" },
    { mode: "for_county", label: "County audience" },
    { mode: "for_press", label: "Press / professional" },
    { mode: "subject_lines", label: "Subject lines" },
    { mode: "cta_options", label: "CTA options" },
  ];

  const aiAvailable = openaiServerConfigured;

  return (
    <div className="space-y-3">
      <section className="rounded border border-kelly-navy/20 bg-kelly-fog/40 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-navy">Campaign Voice</h3>
        <p className="mt-1 text-[9px] text-kelly-text/70">
          EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2 — production operator drafting. Guidance is curated from repo docs
          (paths below); semantic RAG requires separate ingest per{" "}
          <code className="rounded bg-white/80 px-0.5 text-[8px]">src/lib/openai/README.md</code>.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] text-kelly-text/80">
            Tone profile
            <select
              value={activeDraft.campaignVoice.toneProfileId}
              onChange={(e) => setVoice({ toneProfileId: e.target.value })}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              {TONE_PROFILES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80">
            Issue frame
            <select
              value={activeDraft.campaignVoice.issueFrameId}
              onChange={(e) => setVoice({ issueFrameId: e.target.value })}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              {ISSUE_FRAMES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80">
            Audience frame
            <select
              value={activeDraft.campaignVoice.audienceFrameId}
              onChange={(e) => setVoice({ audienceFrameId: e.target.value })}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              {AUDIENCE_FRAMES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80">
            CTA frame
            <select
              value={activeDraft.campaignVoice.ctaFrameId}
              onChange={(e) => setVoice({ ctaFrameId: e.target.value })}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              {CTA_FRAMES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80">
            Risk level
            <select
              value={activeDraft.campaignVoice.riskLevel}
              onChange={(e) => setVoice({ riskLevel: e.target.value as MessageStudioCampaignVoiceSettings["riskLevel"] })}
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              <option value="low">Low</option>
              <option value="standard">Standard</option>
              <option value="elevated">Elevated</option>
            </select>
          </label>
          <label className="text-[10px] text-kelly-text/80">
            Approval level (voice packet)
            <select
              value={activeDraft.campaignVoice.approvalLevel}
              onChange={(e) =>
                setVoice({ approvalLevel: e.target.value as MessageStudioCampaignVoiceSettings["approvalLevel"] })
              }
              className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            >
              <option value="coordinator">Coordinator</option>
              <option value="comms_lead">Comms lead</option>
              <option value="dual_signoff">Dual signoff</option>
              <option value="finance_counsel">Finance + counsel</option>
              <option value="candidate_final">Candidate final</option>
            </select>
          </label>
        </div>

        <div className="mt-2 rounded border border-kelly-text/10 bg-white/80 p-2">
          <p className="text-[9px] font-bold uppercase text-kelly-text/55">Source context (what the draft should lean on)</p>
          <p className="mt-0.5 text-[9px] text-kelly-text/65">
            Toggle what you have reviewed elsewhere. AI and checklists treat unchecked items as thin context.
          </p>
          <ul className="mt-1 grid gap-1 sm:grid-cols-2">
            {(
              [
                ["campaignMission", "Campaign mission / values docs"],
                ["priorWriting", "Prior approved writing"],
                ["queueItemContext", "Queue item context"],
                ["audienceContext", "Audience definition context"],
                ["profileFacts", "Profile facts (approved)"],
                ["importSource", "Import provenance"],
                ["sendgridCompliance", "SendGrid suppression / compliance"],
              ] as const
            ).map(([key, label]) => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-kelly-text/85">
                  <input
                    type="checkbox"
                    checked={activeDraft.campaignVoice.sourceLayers[key]}
                    onChange={() => toggleLayer(key)}
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-kelly-text/10 bg-white/90 p-2">
            <p className="text-[9px] font-bold uppercase text-kelly-text/55">Voice principles</p>
            <ul className="mt-1 max-h-28 list-inside list-disc space-y-0.5 overflow-y-auto text-[9px] text-kelly-text/80">
              {CAMPAIGN_VOICE_PRINCIPLES.map((p) => (
                <li key={p.slice(0, 48)}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-rose-200/60 bg-rose-50/70 p-2">
            <p className="text-[9px] font-bold uppercase text-rose-900">Do not say / high risk</p>
            <ul className="mt-1 max-h-28 list-inside list-disc space-y-0.5 overflow-y-auto text-[9px] text-rose-950/90">
              {PROHIBITED_OR_HIGH_RISK_PATTERNS.map((p) => (
                <li key={p.slice(0, 48)}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-2 rounded border border-amber-200/70 bg-amber-50/80 p-2">
          <p className="text-[9px] font-bold uppercase text-amber-950">Source material readiness</p>
          <ul className="mt-1 space-y-1 text-[9px] text-amber-950/95">
            {SOURCE_MATERIAL_READINESS.map((s) => (
              <li key={s.id}>
                <span className="font-semibold">{s.title}</span>{" "}
                <span className="rounded bg-white/80 px-1 font-mono text-[8px]">{s.readiness}</span>
                <br />
                <span className="text-[8px] text-amber-900/90">{s.location}</span> — {s.notes}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 rounded border border-kelly-text/10 bg-white/90 p-2">
          <p className="text-[9px] font-bold uppercase text-kelly-text/55">Compliance reminders</p>
          <ul className="mt-1 list-inside list-disc text-[9px] text-kelly-text/80">
            {COMPLIANCE_GUARDRAILS.map((c) => (
              <li key={c.slice(0, 40)}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="mt-2 flex flex-wrap gap-2 text-[9px]">
          <Link href="/admin/workbench/email-command-center/readiness" className="font-bold text-kelly-forest underline">
            Readiness
          </Link>
          <Link href="/admin/workbench/email-command-center/map" className="font-bold text-kelly-forest underline">
            Route map
          </Link>
          <Link href="/admin/workbench/email-command-center/analytics" className="font-bold text-kelly-forest underline">
            Analytics
          </Link>
          <Link
            href="/admin/workbench/email-command-center/send-execution"
            className="font-bold text-kelly-forest underline"
          >
            Send execution governance
          </Link>
        </div>
      </section>

      <section className="rounded border border-kelly-text/12 bg-white/95 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-kelly-navy">Draft Quality Review (advisory)</h3>
        <p className="mt-1 text-[9px] text-kelly-text/70">
          Readiness:{" "}
          <span className="font-bold text-kelly-navy">
            {tier === "needs_work"
              ? "Needs work"
              : tier === "review_ready"
                ? "Review ready"
                : "Ready for future send gate (still no send)"}
          </span>
          — based on self-checklist, governance acknowledgment, and core fields. Not a legal signoff.
        </p>
        <ul className="mt-2 space-y-1">
          {MESSAGE_QUALITY_CHECKLIST.map((line, i) => {
            const key = QUALITY_KEYS[i] ?? `q_${i}`;
            return (
              <li key={key}>
                <label className="flex cursor-pointer items-start gap-2 text-[10px] text-kelly-text/85">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={activeDraft.qualityChecklist[key] === true}
                    onChange={() => toggleQuality(key)}
                  />
                  <span>{line}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded border border-indigo-200/60 bg-indigo-50/50 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-950">AI Draft Assistant (advisory · no send)</h3>
        {!aiAvailable ? (
          <p className="mt-1 text-[10px] font-semibold text-indigo-950">
            AI drafting unavailable — configure OpenAI on the server (<code className="text-[9px]">OPENAI_API_KEY</code>).
            Manual drafting and Campaign Voice selectors remain fully usable.
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-indigo-950/90">
            Server-side admin action only. Output is <strong>advisory</strong> — human review required. Nothing is sent.
            Apply to fields only with <strong>Use first suggestions + body</strong>.
            {templateSummaryForAi?.trim() ? (
              <span className="mt-1 block font-semibold text-indigo-950">
                Production template context is attached to this generate call.
              </span>
            ) : null}
          </p>
        )}
        <label className="mt-2 block text-[10px] text-kelly-text/80">
          Subject / angle goal (optional hint for generation)
          <input
            value={subjectGoal}
            onChange={(e) => setSubjectGoal(e.target.value)}
            className="mt-0.5 w-full rounded border border-kelly-text/15 px-2 py-1 text-[11px]"
            placeholder="e.g. Thank volunteers after Saturday canvass"
            disabled={!aiAvailable || aiBusy}
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            disabled={!aiAvailable || aiBusy}
            onClick={() => void runGenerate()}
            className="rounded border border-indigo-400/50 bg-indigo-100/80 px-2 py-1 text-[10px] font-bold text-indigo-950 disabled:opacity-45"
          >
            {aiBusy ? "Working…" : "Generate campaign-voice draft"}
          </button>
        </div>
        {aiError ? <p className="mt-1 text-[10px] font-semibold text-rose-800">{aiError}</p> : null}

        <div className="mt-2">
          <p className="text-[9px] font-bold uppercase text-kelly-text/55">Revision tools</p>
          <p className="text-[9px] text-kelly-text/65">Uses current body + Campaign Voice. Subject-lines / CTA modes return structured suggestions.</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {revisionButtons.map((b) => (
              <button
                key={b.mode}
                type="button"
                disabled={!aiAvailable || aiBusy}
                onClick={() => void runRevise(b.mode)}
                className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-[9px] font-semibold text-kelly-slate disabled:opacity-45"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {advisory ? (
          <div className="mt-2 space-y-2 rounded border border-indigo-200/40 bg-white/90 p-2 text-[10px]">
            <p className="font-bold text-indigo-950">Last AI output (stored locally on this draft)</p>
            {advisory.complianceRiskFlags.length ? (
              <div>
                <p className="font-semibold text-rose-900">Compliance / risk flags</p>
                <ul className="list-inside list-disc text-[9px]">
                  {advisory.complianceRiskFlags.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {advisory.sourceLimitations.length ? (
              <div>
                <p className="font-semibold text-amber-900">Source limitations</p>
                <ul className="list-inside list-disc text-[9px]">
                  {advisory.sourceLimitations.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {advisory.unsupportedClaimsTagged ? (
              <p className="text-[9px] text-kelly-text/80">
                <span className="font-semibold">Unsupported / verify:</span> {advisory.unsupportedClaimsTagged}
              </p>
            ) : null}
            {advisory.subjectSuggestions.length ? (
              <div>
                <p className="font-semibold text-kelly-navy">Subject suggestions</p>
                <ol className="list-inside list-decimal text-[9px]">
                  {advisory.subjectSuggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            ) : null}
            {advisory.preheaderSuggestions.length ? (
              <div>
                <p className="font-semibold text-kelly-navy">Preheader suggestions</p>
                <ul className="list-inside list-disc text-[9px]">
                  {advisory.preheaderSuggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {advisory.emailBodyDraft ? (
              <div>
                <p className="font-semibold text-kelly-navy">Body draft</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-kelly-page/60 p-2 text-[9px]">
                  {advisory.emailBodyDraft}
                </pre>
              </div>
            ) : null}
            {advisory.ctaOptions.length ? (
              <div>
                <p className="font-semibold text-kelly-navy">CTA options</p>
                <ul className="list-inside list-disc text-[9px]">
                  {advisory.ctaOptions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <button
              type="button"
              onClick={applyAdvisoryToDraft}
              className="rounded border border-indigo-500/50 bg-indigo-600/90 px-2 py-1 text-[10px] font-bold text-white"
            >
              Use first suggestions + body (replaces subject/preheader/body if present)
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
