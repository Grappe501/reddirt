import Link from "next/link";
import {
  summarizeInstitutionalMemory,
  syncRecommendationLedgerFromActionQueue,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryEngine";
import { loadWeeklyReflections } from "@/lib/intelligence/institutionalMemory/institutionalMemoryStore";
import { CampaignMemoryDashboard } from "./CampaignMemoryDashboard";

export const dynamic = "force-dynamic";

export default async function CampaignMemoryPage() {
  syncRecommendationLedgerFromActionQueue();
  const summary = summarizeInstitutionalMemory();
  const reflections = loadWeeklyReflections();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-17 · Institutional Memory Engine
        </p>
        <h1 className="font-heading text-2xl font-bold">Campaign Memory</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Campaign journal and institutional brain — what we recommended, what we decided, what happened, and what we
          learned. Remembers outcomes; does not execute them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/command-center" className="rounded border border-kelly-navy/30 bg-kelly-navy px-2 py-1 font-bold text-white">
            Command center
          </Link>
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link href="/admin/intelligence/intelligence-memory" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            NSI-13 longitudinal memory
          </Link>
        </div>
      </header>

      <CampaignMemoryDashboard summary={summary} operatorDefault="operator" />

      {reflections.entries.length > 0 ? (
        <section className="mt-8 rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Saved weekly reflections</h2>
          <ul className="mt-3 space-y-3 text-xs text-kelly-muted">
            {reflections.entries
              .slice()
              .reverse()
              .slice(0, 6)
              .map((r) => (
                <li key={r.reflectionId} className="rounded border border-kelly-text/10 p-3">
                  <p className="font-bold text-kelly-navy">
                    {r.weekLabel} · {r.recordedAt.slice(0, 10)} · {r.recordedBy}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Worked:</span> {r.whatWorked.slice(0, 200)}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Learning:</span> {r.whatWeAreLearning.slice(0, 200)}
                  </p>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
