import { getEmailAiReadiness, getEmailAiPolicySummary } from "@/lib/email-workflow/ai/config";
import type { EmailAiAnalysisStoredV1, EmailAiAnalysisV1 } from "@/lib/email-workflow/ai/types";
import { RunEmailWorkflowAiAnalysisButton } from "@/components/admin/email-workflow/RunEmailWorkflowAiAnalysisButton";

function asMetaRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function isStoredEmailAi(v: unknown): v is EmailAiAnalysisStoredV1 {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return o.version === 1 && typeof o.generatedAt === "string";
}

export async function EmailWorkflowAiIntelligencePanel({
  itemId,
  rawMeta,
}: {
  itemId: string;
  rawMeta: unknown;
}) {
  const readiness = getEmailAiReadiness();
  const policy = getEmailAiPolicySummary();
  const meta = asMetaRecord(rawMeta);
  const gmailReview =
    typeof meta.gmailReviewSource === "object" &&
    meta.gmailReviewSource != null &&
    !Array.isArray(meta.gmailReviewSource)
      ? (meta.gmailReviewSource as Record<string, unknown>)
      : null;
  const metadataOnlyFromGmail = Boolean(gmailReview && gmailReview.bodyStored !== true);

  const stored: EmailAiAnalysisStoredV1 | null = isStoredEmailAi(meta.emailAiAnalysis)
    ? (meta.emailAiAnalysis as EmailAiAnalysisStoredV1)
    : null;
  const out: EmailAiAnalysisV1 | undefined = stored?.output;

  const limitedContext =
    metadataOnlyFromGmail ||
    (out?.sourceLimitations?.length ?? 0) > 0 ||
    (out?.missingContext?.length ?? 0) > 0;

  return (
    <div className="mt-2 space-y-2 rounded border border-kelly-text/10 bg-kelly-page/45 p-2">
      <h2 className="font-heading text-sm font-bold text-kelly-text">AI Email Intelligence</h2>
      <p className="text-[10px] leading-snug text-kelly-muted">
        <span className="font-semibold text-kelly-text">EMAIL-AI-INTELLIGENCE-1.0</span> — advisory only. OpenAI does
        not send email, does not approve queue moves, and does not update profiles or audiences automatically.
      </p>

      <div className="rounded border border-kelly-text/10 bg-white/75 px-2 py-1.5">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">Readiness</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-kelly-text/85">
          <li>
            OpenAI Email Intelligence:{" "}
            <strong className="text-kelly-text">{readiness.configured ? "configured" : "not configured"}</strong>
            {!readiness.configured ? (
              <span className="text-kelly-muted"> — set OPENAI_API_KEY in the environment (name only here).</span>
            ) : null}
          </li>
          <li>
            Safe analysis (API):{" "}
            <strong className="text-kelly-text">{readiness.safeAnalysisAvailable ? "available" : "unavailable"}</strong>
          </li>
          <li>
            Model (env): <code className="rounded bg-kelly-text/5 px-0.5 text-[10px]">{readiness.modelName || "—"}</code>
          </li>
        </ul>
      </div>

      <ul className="list-inside list-disc space-y-0.5 text-[10px] text-rose-900/90">
        <li>AI cannot send email from this queue.</li>
        <li>AI cannot approve or change queue status.</li>
        <li>AI cannot update volunteer/contact profiles automatically.</li>
      </ul>

      {metadataOnlyFromGmail ? (
        <p className="rounded border border-amber-200/70 bg-amber-50/80 px-2 py-1 text-[10px] text-amber-950">
          This queue item was created from Gmail <strong>metadata only</strong>. No Gmail body was read by RedDirt for
          this bridge. Analysis may be limited because only queue fields and provenance are available.
        </p>
      ) : (
        <p className="text-[10px] text-kelly-muted">
          Analysis uses EmailWorkflowItem row fields and safe JSON provenance only — not Gmail message bodies in this
          lane.
        </p>
      )}

      {limitedContext && out ? (
        <p className="text-[10px] text-kelly-muted">
          Analysis may be limited because only metadata and queue summaries are available.
        </p>
      ) : null}

      <RunEmailWorkflowAiAnalysisButton itemId={itemId} />

      {stored ? (
        <div className="space-y-2 border-t border-kelly-text/10 pt-2">
          <p className="text-[10px] text-kelly-muted">
            Last run: <span className="font-semibold text-kelly-text/75">{stored.generatedAt}</span>
            {stored.promptVersion ? (
              <>
                {" "}
                · prompt <code className="text-[9px]">{stored.promptVersion}</code>
              </>
            ) : null}
          </p>
          {stored.inputSourceSummary ? (
            <p className="text-[10px] text-kelly-muted">
              <span className="font-semibold text-kelly-muted">Input summary:</span> {stored.inputSourceSummary}
            </p>
          ) : null}

          {stored.lastErrorSafe && !out ? (
            <p className="rounded border border-rose-200/60 bg-rose-50/70 px-2 py-1 text-[11px] text-rose-950">
              {stored.lastErrorSafe}
            </p>
          ) : null}

          {out ? (
            <div className="space-y-2 text-[11px] text-kelly-text/85">
              <div className="grid gap-1 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-kelly-text">Intent:</span> {out.intent || "—"}
                </p>
                <p>
                  <span className="font-semibold text-kelly-text">Urgency:</span> {out.urgency || "—"}
                </p>
                <p>
                  <span className="font-semibold text-kelly-text">Sentiment:</span> {out.sentiment || "—"}
                </p>
                <p>
                  <span className="font-semibold text-kelly-text">Confidence:</span>{" "}
                  {Number.isFinite(out.confidence) ? `${Math.round(out.confidence * 100)}%` : "—"}
                </p>
              </div>
              {(out.confidenceRationale ?? "").trim() ? (
                <p className="rounded border border-slate-200/80 bg-slate-50/80 px-2 py-1 text-[10px] text-kelly-text/85">
                  <span className="font-semibold text-kelly-text">Confidence rationale:</span> {out.confidenceRationale}
                </p>
              ) : null}
              <p>
                <span className="font-semibold text-kelly-text">Campaign impact:</span> {out.campaignImpact || "—"}
              </p>
              <p>
                <span className="font-semibold text-kelly-text">Recommended next action:</span>{" "}
                {out.recommendedNextAction || "—"}
              </p>
              <p>
                <span className="font-semibold text-kelly-text">Suggested owner role:</span>{" "}
                {out.recommendedOwnerRole || "—"}
              </p>
              <p>
                <span className="font-semibold text-kelly-text">Escalation:</span> {out.escalationRecommendation || "—"}
              </p>

              <div>
                <p className="font-semibold text-kelly-text">Reply draft (advisory — not sent)</p>
                <p className="text-[10px] text-kelly-muted">Tone: {out.replyDraftTone || "—"}</p>
                <p className="mt-1 text-[9px] text-amber-950/90">
                  Treat as <strong>suggested language</strong> unless a line clearly restates queue summaries — compare
                  with <strong>source-backed observations</strong> below.
                </p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-kelly-text/10 bg-white p-2 text-[10px]">
                  {out.replyDraft?.trim() ? out.replyDraft : "—"}
                </pre>
              </div>

              {(out.uncertaintyNotes ?? []).length ? (
                <div className="rounded border border-violet-200/70 bg-violet-50/80 p-2">
                  <p className="font-semibold text-violet-950">Uncertainty (model-labeled)</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px] text-violet-950/95">
                    {(out.uncertaintyNotes ?? []).map((u) => (
                      <li key={u}>{u}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(out.sourceBackedObservations ?? []).length ? (
                <div>
                  <p className="font-semibold text-emerald-950">Source-backed observations (queue text only)</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px] text-emerald-950/95">
                    {(out.sourceBackedObservations ?? []).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(out.suggestedLanguageNotes ?? []).length ? (
                <div>
                  <p className="font-semibold text-kelly-text/75">Suggested language notes (not new facts)</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px] text-kelly-text/80">
                    {(out.suggestedLanguageNotes ?? []).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(out.operatorReviewTasks ?? []).length ? (
                <div className="rounded border border-kelly-text/12 bg-kelly-fog/50 p-2">
                  <p className="font-semibold text-kelly-navy">Operator review tasks</p>
                  <ol className="mt-0.5 list-inside list-decimal text-[10px] text-kelly-text/90">
                    {(out.operatorReviewTasks ?? []).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {out.suggestedActions?.length ? (
                <div>
                  <p className="font-semibold text-kelly-text">Suggested actions (advisory)</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px] text-kelly-text/85">
                    {out.suggestedActions.map((a) => (
                      <li key={`${a.label}-${a.detail ?? ""}`}>
                        <span className="font-semibold">{a.label}</span>
                        {a.detail ? ` — ${a.detail}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(out.reviewIntelligenceSummary ?? "").trim() ? (
                <div className="rounded border border-indigo-200/70 bg-indigo-50/70 p-2">
                  <p className="font-semibold text-indigo-950">Review intelligence (editorial handoff)</p>
                  <p className="mt-1 text-[10px] text-indigo-950/95">{out.reviewIntelligenceSummary}</p>
                </div>
              ) : null}

              {out.riskFlags.length ? (
                <div>
                  <p className="font-semibold text-kelly-text">Risk flags</p>
                  <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-[10px]">
                    {out.riskFlags.map((r) => (
                      <li key={`${r.code}-${r.label}`}>
                        <span className="font-semibold">{r.label}</span> ({r.code})
                        {r.detail ? ` — ${r.detail}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {out.complianceWarnings.length ? (
                <div>
                  <p className="font-semibold text-kelly-text">Compliance warnings</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px]">
                    {out.complianceWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {out.profileFactSuggestions.length ? (
                <div>
                  <p className="font-semibold text-kelly-text">Profile fact suggestions</p>
                  <p className="text-[9px] text-amber-900/90">Suggestions only — verify before any profile merge.</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px]">
                    {out.profileFactSuggestions.map((s) => (
                      <li key={s.suggestion}>{s.suggestion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {out.audienceHints.length ? (
                <div>
                  <p className="font-semibold text-kelly-text">Audience hints</p>
                  <p className="text-[9px] text-amber-900/90">Not applied — no segments created from this panel.</p>
                  <ul className="mt-0.5 list-inside list-disc text-[10px]">
                    {out.audienceHints.map((h) => (
                      <li key={h.hint}>{h.hint}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(out.sourceLimitations.length || out.missingContext.length) > 0 ? (
                <div className="text-[10px] text-kelly-muted">
                  {out.sourceLimitations.length ? (
                    <p>
                      <span className="font-semibold text-kelly-text/80">Source limitations:</span>{" "}
                      {out.sourceLimitations.join(" · ")}
                    </p>
                  ) : null}
                  {out.missingContext.length ? (
                    <p className="mt-1">
                      <span className="font-semibold text-kelly-text/80">Missing context:</span>{" "}
                      {out.missingContext.join(" · ")}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <p className="text-[9px] text-kelly-muted">
                bodyWasAvailable: {String(out.bodyWasAvailable)} · shouldSendAutomatically:{" "}
                {String(out.shouldSendAutomatically)} · canSendFromQueue: {String(out.canSendFromQueue)}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-[11px] text-kelly-muted">No AI analysis stored yet — run analysis above when configured.</p>
      )}

      <details className="text-[10px] text-kelly-muted">
        <summary className="cursor-pointer font-semibold text-kelly-muted">Policy summary</summary>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {policy.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
