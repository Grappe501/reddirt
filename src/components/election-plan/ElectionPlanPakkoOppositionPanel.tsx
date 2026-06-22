import Link from "next/link";

import {
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import { loadMichaelPackoCandidateDossier } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { loadMichaelPackoQuotes } from "@/lib/intelligence/opponents/loadMichaelPackoQuotes";
import { loadMichaelPackoScaffold } from "@/lib/intelligence/opponents/loadMichaelPackoScaffold";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";

type Props = {
  variant?: "hub" | "module";
};

export function ElectionPlanPakkoOppositionPanel({ variant = "module" }: Props) {
  const dossier = loadMichaelPackoCandidateDossier();
  const quotes = loadMichaelPackoQuotes();
  const scaffold = loadMichaelPackoScaffold();
  const gate = getPackoContrastGateStatus();

  return (
    <div className="space-y-6">
      <article className="ep-card border-indigo-300 bg-indigo-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-indigo-900">Dr. Michael Pakko · Libertarian</p>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{dossier.executiveSummary}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Dossier status: {dossier.dossierStatus}</p>
      </article>

      <article className={`ep-card p-5 text-sm ${!gate.blocked ? "border-emerald-300 bg-emerald-50/20" : "border-amber-300 bg-amber-50/20"}`}>
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Contrast gate</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{gate.message}</p>
        {gate.blocked ? (
          <p className="mt-2 text-xs font-bold text-amber-900">
            Kelly: use respect lines only until PACKO-01/02 research completes — no unsourced reform specifics.
          </p>
        ) : null}
      </article>

      <section>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">What Pakko claims</h3>
        <ul className="mt-3 space-y-2">
          {dossier.whatTheyClaim.slice(0, 4).map((c) => (
            <li key={c.claim.slice(0, 48)} className="ep-card p-3 text-sm">
              <p className="text-[var(--ep-navy)]">{c.claim}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                {c.evidenceStatus} · {c.sourceHint ?? "source on file"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Sourced quotes + Kelly frames</h3>
        <ul className="mt-3 space-y-3">
          {quotes.quotes.map((q) => (
            <li key={q.id} className="ep-card p-4 text-sm">
              <p className="text-[10px] font-bold uppercase text-indigo-800">{q.topic.replaceAll("_", " ")}</p>
              <p className="mt-2 italic text-[var(--ep-navy-muted)]">&ldquo;{q.quoteText}&rdquo;</p>
              <p className="mt-2 text-[var(--ep-navy)]">
                <span className="font-bold">Kelly:</span> {q.kellyResponseFrame}
              </p>
              {q.doNotMisquote ? (
                <p className="mt-2 text-xs font-bold text-amber-900">{q.doNotMisquote}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Lead stories to watch</h3>
        <ul className="mt-3 space-y-2">
          {dossier.leadStoriesToWatch.slice(0, 4).map((story) => (
            <li key={story.id} className="ep-card p-3 text-sm">
              <p className="font-bold text-[var(--ep-navy)]">{story.headline}</p>
              <p className="mt-1 text-[var(--ep-navy-muted)]">{story.watchFor}</p>
              <p className="mt-1 text-xs uppercase text-rose-800">{story.priority}</p>
            </li>
          ))}
        </ul>
      </section>

      {variant === "hub" && scaffold ? (
        <section>
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Research priorities (staff)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {scaffold.researchPriorities.slice(0, 5).map((p) => (
              <li key={p.id} className="ep-card p-3">
                <span className="font-bold text-[var(--ep-navy)]">{p.id}</span> — {p.task}
                <span className="ml-2 text-xs uppercase text-[var(--ep-navy-muted)]">{p.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="flex flex-wrap gap-2 text-xs font-bold">
        <Link href={epOpponentBioHref("michael-packo")} className="rounded-full border border-indigo-400 px-3 py-1">
          Full Pakko bio →
        </Link>
        <Link href={epOppositionResearchModuleHref("pakko-quotes")} className="rounded-full border border-indigo-400 px-3 py-1">
          All quotes →
        </Link>
        <Link href={epOppositionResearchModuleHref("three-way-geometry")} className="rounded-full border border-violet-400 px-3 py-1">
          Three-way geometry →
        </Link>
      </nav>
    </div>
  );
}
