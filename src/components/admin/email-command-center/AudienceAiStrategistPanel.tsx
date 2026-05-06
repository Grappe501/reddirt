"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createDraftEmailAudienceDefinitionAction } from "@/app/admin/email-audience-actions";
import {
  generateAudienceStrategyForGoal,
  type AudienceStrategyReport,
} from "@/lib/email-command-center/ai-audience-strategist";
import type { AudienceBuildingBlockRow, AudienceClusterRow } from "@/lib/email-command-center/audience-studio";

export function AudienceAiStrategistPanel(props: {
  buildingBlocks: AudienceBuildingBlockRow[];
  clusters: AudienceClusterRow[];
}) {
  const [messageGoal, setMessageGoal] = useState("");
  const [campaignContext, setCampaignContext] = useState("");
  const [report, setReport] = useState<AudienceStrategyReport | null>(null);
  const [draftName, setDraftName] = useState("");

  const canRun = messageGoal.trim().length >= 8;

  const primaryCriteriaJson = useMemo(() => {
    if (!report?.primaryCriteria) return "";
    try {
      return JSON.stringify(report.primaryCriteria, null, 2);
    } catch {
      return "";
    }
  }, [report]);

  return (
    <section className="rounded-lg border border-kelly-forest/30 bg-emerald-50/50 p-3">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">AI Audience Strategist</h2>
      <p className="mt-1 text-[10px] leading-snug text-kelly-text/80">
        <span className="font-semibold">EMAIL-AI-AUDIENCE-STRATEGIST-1.0</span> — deterministic recommendations from{" "}
        <strong>approved building blocks</strong> plus your stated goal. No OpenAI on this path; no sends; no protected-attribute
        targeting; no unsupported political claims. <strong>Human approval</strong> still required for drafts and execution.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
          Campaign / message goal (required, min ~8 chars)
          <textarea
            value={messageGoal}
            onChange={(e) => setMessageGoal(e.target.value)}
            rows={3}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-[11px]"
            placeholder="e.g. GOTV reminder for volunteers with confirmed shifts in Pulaski County"
          />
        </label>
        <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
          Optional context (timing, channel, constraints)
          <textarea
            value={campaignContext}
            onChange={(e) => setCampaignContext(e.target.value)}
            rows={2}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-[11px]"
            placeholder="e.g. Send window: 10 days before early vote; staff will review all copy"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            disabled={!canRun}
            onClick={() => {
              setReport(
                generateAudienceStrategyForGoal(
                  { messageGoal: messageGoal.trim(), campaignContext: campaignContext.trim() || undefined },
                  { buildingBlocks: props.buildingBlocks, clusters: props.clusters },
                ),
              );
            }}
            className="rounded border border-kelly-forest/40 bg-kelly-forest/90 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-50"
          >
            Generate strategy
          </button>
          {!canRun ? (
            <p className="mt-1 text-[9px] text-kelly-text/60">Enter a clearer goal so the strategist can anchor recommendations.</p>
          ) : null}
        </div>
      </div>

      {report ? (
        <div className="mt-4 space-y-3 rounded border border-kelly-text/10 bg-white/90 p-2 text-[11px] text-kelly-text/90">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Suggested audiences</p>
            <ul className="mt-1 space-y-2">
              {report.suggestedAudiences.map((s, i) => (
                <li key={i} className="rounded border border-kelly-text/8 bg-kelly-page/40 px-2 py-1">
                  <p className="font-semibold text-kelly-navy">{s.suggestedName}</p>
                  <p className="text-[10px] text-kelly-text/75">{s.rationale}</p>
                  <p className="mt-1 font-mono text-[9px] text-kelly-text/70">{JSON.stringify(s.criteria)}</p>
                  {s.requiredFacts.length ? (
                    <p className="mt-1 text-[9px] text-kelly-text/65">
                      <span className="font-semibold">Required facts:</span>{" "}
                      {s.requiredFacts.map((r) => `${r.factKey}=${r.factValue.slice(0, 80)}`).join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Rationale</p>
            <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/80">
              {report.primaryRationale.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Required facts (primary)</p>
            <ul className="mt-1 space-y-0.5 text-[10px]">
              {report.requiredFacts.length ? (
                report.requiredFacts.map((r, i) => (
                  <li key={i}>
                    <span className="font-mono text-[9px]">{r.factKey}</span>: {r.factValue.slice(0, 160)} — {r.reason}
                  </li>
                ))
              ) : (
                <li className="text-kelly-text/60">None inferred — strengthen approved graph first.</li>
              )}
            </ul>
          </div>

          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
              Excluded / suppression considerations
            </p>
            <ul className="mt-1 list-inside list-disc text-[10px] text-kelly-text/80">
              {report.exclusionSuppressionConsiderations.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Suggested message frames</p>
            <ul className="mt-1 list-inside list-decimal text-[10px] text-kelly-text/80">
              {report.suggestedMessageAngles.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-900/80">Risk warnings</p>
            <ul className="mt-1 list-inside list-disc text-[10px] text-rose-950/90">
              {report.riskWarnings.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-kelly-forest/20 bg-emerald-50/80 px-2 py-1 text-[10px] text-kelly-navy">
            <span className="font-semibold">Recommended next step:</span> {report.recommendedNextStep}
          </div>

          <div className="rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-1 text-[10px] text-kelly-text/80">
            <span className="font-semibold">Heuristic posture:</span> usefulness {report.riskEvaluation.usefulnessScore.toFixed(2)} · risk{" "}
            {report.riskEvaluation.riskLevel} · breadth {report.breadth.posture}
            <ul className="mt-1 list-inside list-disc text-[9px]">
              {report.breadth.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

          {report.clusterRecommendations.filter((c) => c.safeForPlanning).length ? (
            <div>
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
                Safe cluster hints (non-sensitive)
              </p>
              <ul className="mt-1 space-y-1 text-[10px]">
                {report.clusterRecommendations
                  .filter((c) => c.safeForPlanning)
                  .slice(0, 6)
                  .map((c, i) => (
                    <li key={i} className="rounded bg-white/80 px-1 py-0.5 font-mono text-[9px]">
                      {c.label} ({c.matchProfiles}){c.note ? ` — ${c.note}` : ""}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          {primaryCriteriaJson ? (
            <div className="border-t border-kelly-text/10 pt-2">
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-navy">Create draft from primary criteria</p>
              <p className="mt-1 text-[9px] text-kelly-text/70">
                Uses the existing server action — you must name the draft explicitly. Criteria JSON is prefilled from the primary
                suggestion only. Or use the{" "}
                <Link href="#audience-manual-draft" className="font-bold text-kelly-forest underline">
                  manual draft form
                </Link>{" "}
                for fully hand-authored JSON.
              </p>
              <form action={createDraftEmailAudienceDefinitionAction} className="mt-2 grid gap-2">
                <label className="text-[10px] text-kelly-text/80">
                  Draft name
                  <input
                    name="name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    required
                    className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
                    placeholder="e.g. GOTV — volunteer fact slice"
                  />
                </label>
                <label className="text-[10px] text-kelly-text/80">
                  Description (optional)
                  <input name="description" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" placeholder="Internal note" />
                </label>
                <textarea
                  name="criteriaJson"
                  className="sr-only"
                  readOnly
                  value={primaryCriteriaJson}
                  aria-hidden={true}
                  tabIndex={-1}
                />
                <button
                  type="submit"
                  disabled={!draftName.trim()}
                  className="rounded border border-kelly-navy/40 bg-kelly-navy/10 px-2 py-1 text-[11px] font-bold text-kelly-navy disabled:opacity-50"
                >
                  Create draft audience (explicit submit)
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
