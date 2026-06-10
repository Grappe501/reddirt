import Link from "next/link";

export const dynamic = "force-dynamic";

const DOCTRINE_DOC = "docs/campaign-events/VICTORY_OS_DOCTRINE.md";

export default function PathToVictoryPlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">Victory OS</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Path to Victory</h1>
      <p className="mt-6 font-body text-base leading-relaxed text-kelly-text/85">
        Victory OS doctrine is locked. Sprint 0 begins with the full 75-county Victory Map. The Decision Engine and
        Mission Brief UI will be built after the map is leadership-reviewed.
      </p>
      <p className="mt-4 font-body text-sm text-kelly-muted">
        Canonical doctrine:{" "}
        <code className="rounded border border-kelly-text/15 bg-kelly-page/80 px-1.5 py-0.5 text-xs">{DOCTRINE_DOC}</code>
      </p>
      <p className="mt-8">
        <Link
          href="/admin/ai-command-center"
          className="font-body text-sm font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-slate"
        >
          ← Back to command center
        </Link>
      </p>
    </div>
  );
}
