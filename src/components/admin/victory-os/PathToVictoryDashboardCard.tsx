import Link from "next/link";

/** Strategic entry to Victory OS — links to doctrine-locked mission brief surface (Sprint 3). */
export function PathToVictoryDashboardCard() {
  return (
    <section
      className="rounded-3xl border-2 border-kelly-navy/35 bg-gradient-to-br from-kelly-navy/[0.14] via-kelly-page to-amber-500/[0.08] p-8 shadow-[var(--shadow-soft)]"
      aria-labelledby="path-to-victory-heading"
    >
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">Victory OS · Layer 0–3</p>
      <h2 id="path-to-victory-heading" className="mt-2 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
        Monday Brief · Path to Victory
      </h2>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/80">
        The Campaign OS Monday home — Top 10 decisions, deployment lanes, county missions, and the path to 50% + 1.
      </p>
      <div className="mt-6">
        <Link
          href="/admin/mission-brief"
          className="inline-flex items-center rounded-full bg-kelly-navy px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-kelly-slate"
        >
          Open Monday Brief
        </Link>
      </div>
    </section>
  );
}
