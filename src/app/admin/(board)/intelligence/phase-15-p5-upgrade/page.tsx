import Link from "next/link";
import { Phase15P5UpgradePassPanel } from "@/components/admin/intelligence/Phase15P5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P5Bar,
  computePhase15P5UpgradePass,
  EVIDENCE_HONESTY_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P5Closure";
import { listEvidenceHonestySurfaces } from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";

export const dynamic = "force-dynamic";

export default function Phase15P5UpgradePage() {
  const report = computePhase15P5UpgradePass();
  const bar = assertPhase15P5Bar();
  const surfaces = listEvidenceHonestySurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P5"
        title="Evidence honesty badges"
        description="Unified evidence tier badges on film room, briefings, opposition, and rehearse surfaces — Kelly sees honesty before proof language."
      >
        <V4BackLinks />
        <Link
          href={EVIDENCE_HONESTY_HUB_HREF}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Evidence honesty hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P5UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P5 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p5-evidence-honesty.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Tagged surfaces ({surfaces.length})</h2>
        {surfaces.map((surface) => (
          <article key={surface.surfaceId} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
            <Link href={surface.href} className="font-bold text-kelly-navy underline">
              {surface.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {surface.kind} · {surface.defaultBadge.label}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
