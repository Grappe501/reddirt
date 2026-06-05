import Link from "next/link";
import { DebateGlossaryIndex } from "@/components/admin/intelligence/DebateGlossaryIndex";
import { Phase5UpgradePassPanel } from "@/components/admin/intelligence/Phase5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { PHASE5_HUB_ROUTES } from "@/lib/intelligence/v4/phase5GlossaryConnectivity";
import { computePhase5UpgradePass } from "@/lib/intelligence/v4/phase5GlossaryConnectivity";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase5UpgradePage() {
  const report = computePhase5UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 5"
        title="Debate glossary + hub connectivity"
        description="Term registry, Field Book Phase B/C depth expansion, and canon bindings for every remaining intelligence hub."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/field-book/glossary"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Glossary index
        </Link>
        <Link
          href="/admin/intelligence/field-book/phase/phase-b"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Field Book Phase B
        </Link>
      </V4PageHeader>

      <Phase5UpgradePassPanel report={report} />

      <article className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Phase 5 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Debate glossary registry — 35+ terms with categories, definitions, and cross-links.</li>
          <li>Field Book Phase B/C articles expanded to six-paragraph briefing bar.</li>
          <li>Canon bindings on coaching, opposition strategy, staff tools, and clerk VVSG hubs.</li>
          <li>Strategy migration bridge extended to 26+ intelligence routes.</li>
        </ol>
      </article>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Hub connectivity ({PHASE5_HUB_ROUTES.length} routes)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {PHASE5_HUB_ROUTES.map((href) => {
            const bound = Boolean(resolveCanonBinding(href));
            return (
              <li key={href} className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${bound ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}
                >
                  {bound ? "BOUND" : "UNBOUND"}
                </span>
                <Link href={href} className="font-mono text-xs text-kelly-navy underline">
                  {href}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-bold text-kelly-navy">Glossary preview</h2>
        <DebateGlossaryIndex />
      </section>
    </div>
  );
}
