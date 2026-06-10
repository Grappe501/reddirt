import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Doctrine-locked placeholder — Sprint 0 begins with the 75-county Victory Map.
 * Decision Engine and Mission Brief UI ship after leadership map review.
 */
export default function PathToVictoryPlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-copper">Victory OS · Doctrine locked</p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-kelly-navy">Path to Victory</h1>
      <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
        Victory OS doctrine is locked. Sprint 0 begins with the full 75-county Victory Map. The Decision Engine and Mission
        Brief UI will be built after the map is leadership-reviewed.
      </p>
      <p className="mt-6 font-body text-sm text-kelly-muted">
        Canonical doctrine:{" "}
        <code className="rounded bg-kelly-text/5 px-1.5 py-0.5 text-xs">
          RedDirt/docs/campaign-events/VICTORY_OS_DOCTRINE.md
        </code>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/ai-command-center"
          className="rounded-full border border-kelly-navy/25 px-4 py-2 font-body text-sm font-bold text-kelly-navy transition hover:border-kelly-navy/40"
        >
          ← Campaign OS command center
        </Link>
      </div>
    </div>
  );
}
