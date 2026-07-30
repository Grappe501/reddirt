"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  buildEvidenceShipReportAction,
  getFitRankedBacklogAction,
  rankEvidenceNextActionsAction,
  runEventNightLoopAction,
  runEvidenceAiCommandAction,
  runPublishQueueTurboAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EvidenceCommandResult } from "@/lib/campaign-media/evidence-ai-command";
import { ewBtnPrimaryClass } from "@/components/admin/evidence-workbench/evidenceWorkbenchChrome";

const STARTERS = [
  "What should I do next on the Evidence Workbench?",
  "Propose an event-night pack for the most recent Confirmed calendar row.",
  "Where are Unknown-county stills blocking Approve?",
  "What still needs commit on the Publish desk?",
  "Which speeches need county confirm before publish?",
  "Rank Unknown stills by website fit without inventing geography.",
];

type MacroId = "next" | "event-night" | "queue-turbo" | "fit-backlog" | "publish-status";

const MACROS: Array<{ id: MacroId; label: string; hint: string }> = [
  { id: "next", label: "Next", hint: "Rank deterministic next clicks" },
  { id: "event-night", label: "Event night", hint: "Pack + turbo (confirm) — Approve on County" },
  { id: "queue-turbo", label: "Queue turbo", hint: "Unknown turbo → Identify / County" },
  { id: "fit-backlog", label: "Fit backlog", hint: "Score Unknown/needs-approval" },
  { id: "publish-status", label: "Publish status", hint: "Open Publish desk checklist" },
];

/**
 * Compact Command bar (Round A) — macros first; freeform + starters on demand.
 */
export function EvidenceAiCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EvidenceCommandResult | null>(null);
  const [showAsk, setShowAsk] = useState(false);
  const [showStarters, setShowStarters] = useState(false);
  const [pending, start] = useTransition();

  function run(text: string) {
    const q = text.trim();
    if (!q) return;
    setPrompt(q);
    setShowAsk(true);
    start(async () => {
      setMessage("Command running…");
      setResult(null);
      const res = await runEvidenceAiCommandAction(q);
      setMessage(res.message);
      if (res.ok && res.result) setResult(res.result);
    });
  }

  function runMacro(id: MacroId) {
    start(async () => {
      setResult(null);
      if (id === "next") {
        const res = await rankEvidenceNextActionsAction(6);
        setMessage(res.message);
        const actions = res.result?.actions ?? [];
        if (actions.length) {
          setResult({
            headline: "Next actions (deterministic)",
            plan: actions.map((a) => `${a.title} — ${a.why}`),
            nextClicks: actions.map((a) => ({ label: a.title, href: a.href })),
            toolsSummary: "rank_evidence_next_actions",
            toolsUsed: ["rank_evidence_next_actions"],
            warnings: [],
            confidence: "high",
            model: "local",
          });
        }
        return;
      }
      if (id === "event-night") {
        const res = await runEventNightLoopAction({
          confirmTurbo: true,
          useAi: true,
          maxPhotos: 16,
        });
        setMessage(res.message);
        setResult({
          headline: "Event-night loop finished (proposals only)",
          plan: [
            res.pack
              ? `Pack ${res.pack.date} · ${res.pack.photos.length} photos · ${res.pack.speeches.length} speeches`
              : "No pack",
            res.turboMessage ?? "Turbo skipped",
            res.ship
              ? `Publish desk pending · overlays dirty ${res.ship.totals.overlayJsonDirty} · promoted missing ${res.ship.totals.promotedOverrideMissing}`
              : "No publish status",
            "Open County Tonight ritual to Approve — Ship last mile only on Publish desk.",
          ],
          nextClicks: [
            { label: "Tonight ritual / County", href: "/admin/evidence-workbench?tab=county" },
            { label: "Publish desk", href: "/admin/evidence-workbench?tab=publish#ew-ship-last-mile" },
            { label: "Identify Unknown", href: "/admin/evidence-workbench?tab=identify&filter=unknown" },
          ],
          toolsSummary: "run_event_night_loop",
          toolsUsed: ["propose_event_night_pack", "turbo_ingest_photos", "build_evidence_ship_report"],
          warnings: res.pack?.warnings ?? [],
          confidence: "medium",
          model: "local",
        });
        return;
      }
      if (id === "queue-turbo") {
        const turbo = await runPublishQueueTurboAction({ confirm: true, useAi: true, maxPhotos: 24 });
        setMessage(turbo.message);
        setResult({
          headline: "Queue turbo (proposals only)",
          plan: [
            turbo.message,
            "Review Apply → Save on Identify, Approve on County, Ship on Publish.",
          ],
          nextClicks: [
            { label: "Unknown on Identify", href: "/admin/evidence-workbench?tab=identify&filter=unknown" },
            {
              label: "Needs approval on County",
              href: "/admin/evidence-workbench?tab=county&filter=needsApproval",
            },
            { label: "Publish desk", href: "/admin/evidence-workbench?tab=publish#ew-ship-last-mile" },
          ],
          toolsSummary: "run_publish_queue_turbo",
          toolsUsed: ["run_publish_queue_turbo"],
          warnings: [],
          confidence: "medium",
          model: "local",
        });
        return;
      }
      if (id === "fit-backlog") {
        const res = await getFitRankedBacklogAction({ limit: 12 });
        setMessage(res.message);
        setResult({
          headline: "Fit-ranked backlog",
          plan: (res.backlog?.rows ?? []).map(
            (r) =>
              `${r.photoId} · ${r.bestSurface ?? "—"} (${r.bestScore}) · ${r.county}${
                r.unknown ? " · Unknown" : ""
              }`,
          ),
          nextClicks: (res.backlog?.rows ?? []).slice(0, 6).map((r) => ({
            label: r.photoId,
            href: r.href,
          })),
          toolsSummary: "score_photo_website_fit backlog",
          toolsUsed: ["score_photo_website_fit"],
          warnings: ["Scores propose placement affinity — Prefer Unknown; confirm before Approve."],
          confidence: "medium",
          model: "local",
        });
        return;
      }
      // publish-status — report only; binaries ship on Publish desk
      const ship = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: true,
      });
      setMessage(ship.message);
      setResult({
        headline: "Publish desk status",
        plan: ship.report?.nextActions ?? [ship.message],
        nextClicks: [
          {
            label: "Open Publish / Ship last mile",
            href: "/admin/evidence-workbench?tab=publish#ew-ship-last-mile",
          },
          { label: "County desk", href: "/admin/evidence-workbench?tab=county" },
        ],
        toolsSummary: "build_evidence_ship_report",
        toolsUsed: ["build_evidence_ship_report"],
        warnings: ship.report?.warnings?.slice(0, 4) ?? [],
        confidence: "high",
        model: "local",
      });
    });
  }

  return (
    <div className="ew-command mt-4">
      <div className="relative z-[1]">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-kelly-gold-soft">
              Evidence Command
            </p>
            <p className="mt-1 font-heading text-lg font-bold tracking-tight text-white md:text-xl">
              Macros · Prefer Unknown · never silent Approve
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAsk((v) => !v)}
            className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-body text-[11px] font-semibold text-white/90 hover:bg-white/15"
          >
            {showAsk ? "Hide ask" : "Ask workbench"}
          </button>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {MACROS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                disabled={pending}
                title={m.hint}
                onClick={() => runMacro(m.id)}
                className="rounded-md border border-kelly-gold/45 bg-kelly-gold/15 px-2.5 py-1 font-body text-[11px] font-bold text-kelly-gold-soft transition hover:bg-kelly-gold/25 disabled:opacity-50"
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>

        {showAsk ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="Ask across calendar · photos · videos · intake · placement · publish"
                className="min-h-[64px] flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-body text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:border-kelly-gold/50 focus:outline-none focus:ring-2 focus:ring-kelly-gold/40"
              />
              <button
                type="button"
                disabled={pending || !prompt.trim()}
                onClick={() => run(prompt)}
                className={`${ewBtnPrimaryClass} sm:self-stretch sm:px-5`}
              >
                {pending ? "Thinking…" : "Run"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowStarters((v) => !v)}
              className="font-body text-[11px] font-semibold text-white/70 underline"
            >
              {showStarters ? "Hide starter prompts" : "Show starter prompts"}
            </button>
            {showStarters ? (
              <ul className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(s)}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-body text-[11px] text-white/85 transition hover:border-kelly-gold/50 hover:bg-white/10 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {message ? <p className="mt-3 font-body text-xs text-kelly-gold-soft">{message}</p> : null}

        {result ? (
          <div className="mt-3 space-y-3 rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-sm">
            <p className="font-heading text-base font-bold text-white">{result.headline}</p>
            {result.plan.length ? (
              <ol className="list-decimal space-y-1 pl-5 font-body text-sm text-white/90">
                {result.plan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {result.nextClicks.length ? (
              <div className="flex flex-wrap gap-2">
                {result.nextClicks.map((c) => (
                  <Link
                    key={`${c.label}-${c.href}`}
                    href={c.href}
                    className="rounded-full border border-kelly-gold/40 bg-kelly-gold/15 px-3 py-1.5 font-body text-xs font-semibold text-kelly-gold-soft transition hover:bg-kelly-gold/25"
                  >
                    {c.label} →
                  </Link>
                ))}
              </div>
            ) : null}
            {result.toolsSummary ? (
              <p className="font-mono text-[10px] text-white/50">{result.toolsSummary}</p>
            ) : null}
            {result.warnings.length ? (
              <ul className="list-disc space-y-0.5 pl-4 font-body text-[11px] text-white/60">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
