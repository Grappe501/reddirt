"use client";

import { useMemo, useState, useTransition } from "react";
import {
  critiqueMessageStudioDraftAction,
  generateRevisionPlanAction,
  persistCritiqueToServerDraftMetadataAction,
} from "@/app/admin/message-studio-draft-critic-actions";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  DRAFT_CRITIQUE_DIMENSION_IDS,
  parseStoredCritiqueJson,
  serializeCritiqueForStorage,
  type DraftCritiqueResult,
} from "@/lib/email-command-center/ai-draft-critic";

const DIMENSION_LABELS: Record<string, string> = {
  clarity: "Clarity",
  persuasion: "Persuasion",
  campaign_voice_fit: "Campaign voice fit",
  factual_claim_risk: "Factual claim risk",
  unsupported_claim_risk: "Unsupported claim risk",
  tone_risk: "Tone risk",
  audience_mismatch: "Audience mismatch",
  cta_weakness: "CTA weakness",
  compliance_issue: "Compliance checklist",
  fundraising_caution: "Fundraising caution",
  press_sensitivity: "Press sensitivity",
  length_readability: "Length / readability",
  subject_body_mismatch: "Subject / body mismatch",
  reply_confusion_risk: "Reply / confusion risk",
};

const RISK_DIMENSIONS = new Set([
  "factual_claim_risk",
  "unsupported_claim_risk",
  "tone_risk",
  "reply_confusion_risk",
]);

function formatPlanForCopy(c: DraftCritiqueResult): string {
  const lines = [
    `AI Draft Critic — ${c.generatedAt} (${c.mode})`,
    "",
    "Overall:",
    c.overallSummary,
    "",
    "Revision plan:",
    ...c.revisionPlan.steps.map((s, i) => {
      const tag = s.needsSource ? " [needs source / counsel]" : "";
      return `${i + 1}. ${s.title}${tag}\n   ${s.detail}`;
    }),
    "",
    c.revisionPlan.summary,
  ];
  return lines.join("\n");
}

function severityChip(sev: string): string {
  switch (sev) {
    case "high":
      return "border-rose-300/80 bg-rose-50 text-rose-950";
    case "medium":
      return "border-amber-300/80 bg-amber-50 text-amber-950";
    default:
      return "border-slate-200/90 bg-slate-50 text-slate-800";
  }
}

type Props = {
  activeDraft: MessageStudioLocalDraft;
  patchActive: (patch: Partial<MessageStudioLocalDraft>) => void;
  /** From server: OPENAI_API_KEY present — never exposes the secret. */
  openaiServerConfigured?: boolean;
};

export function MessageStudioDraftCriticPanel({
  activeDraft,
  patchActive,
  openaiServerConfigured = false,
}: Props) {
  const [includeOpenAi, setIncludeOpenAi] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const storedCritique = useMemo(
    () => parseStoredCritiqueJson(activeDraft.lastDraftCritiqueJson),
    [activeDraft.lastDraftCritiqueJson],
  );

  const runCritique = () => {
    setErr(null);
    setHint(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("localDraftJson", JSON.stringify(activeDraft));
      if (includeOpenAi && openaiServerConfigured) fd.set("includeOpenAi", "1");
      const r = await critiqueMessageStudioDraftAction(fd);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      patchActive({ lastDraftCritiqueJson: serializeCritiqueForStorage(r.critique) });
      setHint(
        activeDraft.linkedServerDraftId?.trim()
          ? "Critique saved on this draft (local). Use “Save critique to shared draft” if the team needs it on the server row (metadata only)."
          : "Critique saved on this draft (local).",
      );
    });
  };

  const regeneratePlan = () => {
    setErr(null);
    setHint(null);
    startTransition(async () => {
      const current = parseStoredCritiqueJson(activeDraft.lastDraftCritiqueJson);
      if (!current) {
        setErr("Run a critique first.");
        return;
      }
      const fd = new FormData();
      fd.set("critiqueJson", JSON.stringify(current));
      const r = await generateRevisionPlanAction(fd);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      const next: DraftCritiqueResult = { ...current, revisionPlan: r.plan };
      patchActive({ lastDraftCritiqueJson: serializeCritiqueForStorage(next) });
      setHint("Revision plan regenerated from the stored scorecard.");
    });
  };

  const copyPlan = async () => {
    if (!storedCritique) return;
    const text = formatPlanForCopy(storedCritique);
    try {
      await navigator.clipboard.writeText(text);
      setHint("Revision plan copied to clipboard.");
    } catch {
      setErr("Clipboard unavailable in this browser context.");
    }
  };

  const appendToReviewNotes = () => {
    if (!storedCritique) return;
    const block = formatPlanForCopy(storedCritique);
    const prev = activeDraft.editorialReviewNotes.trim();
    patchActive({
      editorialReviewNotes: prev
        ? `${prev}\n\n--- AI Draft Critic — revision plan ---\n${block}`
        : `--- AI Draft Critic — revision plan ---\n${block}`,
    });
    setHint("Appended revision plan to editorial review notes only (not subject/body).");
  };

  const clearLocalCritique = () => {
    patchActive({ lastDraftCritiqueJson: "" });
    setHint("Cleared stored critique from this local draft.");
  };

  const persistServer = () => {
    const id = activeDraft.linkedServerDraftId?.trim();
    if (!id || !storedCritique) return;
    setErr(null);
    setHint(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("serverDraftId", id);
      fd.set("critiqueJson", serializeCritiqueForStorage(storedCritique));
      const r = await persistCritiqueToServerDraftMetadataAction(fd);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      setHint("Critique saved to shared draft metadata (no body/subject changes).");
    });
  };

  return (
    <div className="mt-2 rounded border border-cyan-200/80 bg-cyan-50/90 p-2 text-[10px] text-cyan-950">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading font-bold text-cyan-950">AI Draft Critic</p>
          <p className="mt-0.5 max-w-3xl text-[9px] leading-snug text-cyan-900/95">
            EMAIL-AI-DRAFT-CRITIC-1.0 — red-team scorecard and revision plan.{" "}
            <span className="font-semibold">Advisory only:</span> AI cannot approve, send, or overwrite copy. Unsupported
            claims must be handled with editorial sources or removal — the critic flags “needs source,” it does not
            invent citations.
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runCritique}
          disabled={pending}
          className="rounded border border-cyan-700/40 bg-white px-2 py-1 text-[10px] font-bold text-cyan-950 hover:bg-cyan-100/80 disabled:opacity-50"
        >
          {pending ? "Running…" : "Run critique"}
        </button>
        {openaiServerConfigured ? (
          <label className="flex items-center gap-1 text-[9px] text-cyan-900">
            <input
              type="checkbox"
              checked={includeOpenAi}
              onChange={(e) => setIncludeOpenAi(e.target.checked)}
              className="h-3 w-3"
            />
            Include optional OpenAI layer (server-gated)
          </label>
        ) : (
          <span className="text-[9px] text-cyan-800/80">OpenAI layer unavailable (server has no API key).</span>
        )}
        <button
          type="button"
          onClick={regeneratePlan}
          disabled={pending || !storedCritique}
          className="rounded border border-cyan-600/30 bg-white/90 px-2 py-1 text-[9px] font-semibold text-cyan-900 hover:bg-white disabled:opacity-50"
        >
          Regenerate revision plan
        </button>
        <button
          type="button"
          onClick={() => void copyPlan()}
          disabled={!storedCritique}
          className="rounded border border-cyan-600/30 bg-white/90 px-2 py-1 text-[9px] font-semibold text-cyan-900 hover:bg-white disabled:opacity-50"
        >
          Copy revision plan
        </button>
        <button
          type="button"
          onClick={appendToReviewNotes}
          disabled={!storedCritique}
          className="rounded border border-cyan-600/30 bg-white/90 px-2 py-1 text-[9px] font-semibold text-cyan-900 hover:bg-white disabled:opacity-50"
        >
          Append plan to review notes
        </button>
        {activeDraft.linkedServerDraftId?.trim() ? (
          <button
            type="button"
            onClick={persistServer}
            disabled={pending || !storedCritique}
            className="rounded border border-cyan-700/50 bg-cyan-700/10 px-2 py-1 text-[9px] font-bold text-cyan-950 hover:bg-cyan-700/15 disabled:opacity-50"
          >
            Save critique to shared draft (metadata)
          </button>
        ) : null}
        <button
          type="button"
          onClick={clearLocalCritique}
          disabled={!storedCritique}
          className="ml-auto rounded border border-slate-300/80 bg-white/80 px-2 py-1 text-[9px] text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Clear local critique
        </button>
      </div>

      {err ? <p className="mt-2 text-[9px] font-semibold text-rose-800">{err}</p> : null}
      {hint ? <p className="mt-2 text-[9px] text-cyan-900/90">{hint}</p> : null}

      {storedCritique ? (
        <div className="mt-3 space-y-3 border-t border-cyan-200/60 pt-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-cyan-900/80">Summary</p>
            <p className="mt-0.5 text-[9px] leading-snug text-cyan-950">{storedCritique.overallSummary}</p>
            <p className="mt-1 font-mono text-[8px] text-cyan-800/80">
              {storedCritique.generatedAt} · {storedCritique.mode}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-cyan-900/80">Scorecard (1–5)</p>
            <p className="mt-0.5 text-[8px] text-cyan-900/85">
              Higher is better for clarity, persuasion, and fit. For dimensions named “risk,” a lower score means higher
              concern.
            </p>
            <ul className="mt-1 grid gap-1 sm:grid-cols-2">
              {DRAFT_CRITIQUE_DIMENSION_IDS.map((id) => {
                const row = storedCritique.scorecard[id];
                const label = DIMENSION_LABELS[id] ?? id;
                const risk = RISK_DIMENSIONS.has(id);
                return (
                  <li
                    key={id}
                    className="rounded border border-cyan-100/90 bg-white/80 px-2 py-1 text-[9px] text-cyan-950"
                  >
                    <span className="font-semibold">{label}</span>
                    <span className="ml-1 font-mono">
                      {row.score}/5{risk ? " (risk)" : ""}
                    </span>
                    {row.note ? <p className="mt-0.5 text-[8px] leading-snug text-cyan-900/90">{row.note}</p> : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-cyan-900/80">Red flags</p>
            {storedCritique.redFlags.length ? (
              <ul className="mt-1 space-y-1">
                {storedCritique.redFlags.map((f, i) => (
                  <li
                    key={`${f.code}-${i}`}
                    className={`flex flex-wrap items-start gap-1 rounded border px-2 py-1 text-[9px] ${severityChip(f.severity)}`}
                  >
                    <span className="font-mono text-[8px] opacity-80">{f.code}</span>
                    <span className="font-semibold uppercase text-[8px]">{f.severity}</span>
                    <span className="min-w-0 flex-1 leading-snug">{f.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[9px] text-cyan-900/80">No heuristic red flags for this pass.</p>
            )}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-cyan-900/80">Revision plan</p>
            <p className="mt-0.5 text-[8px] leading-snug text-cyan-900/85">{storedCritique.revisionPlan.summary}</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-[9px] text-cyan-950">
              {storedCritique.revisionPlan.steps.map((s, idx) => (
                <li key={idx} className="leading-snug">
                  <span className="font-semibold">{s.title}</span>
                  {s.needsSource ? (
                    <span className="ml-1 rounded bg-amber-100 px-1 text-[8px] font-bold text-amber-950">
                      needs source
                    </span>
                  ) : null}
                  <div className="text-[8px] text-cyan-900/90">{s.detail}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[9px] text-cyan-900/85">No critique stored yet — run a pass to populate the scorecard.</p>
      )}
    </div>
  );
}
