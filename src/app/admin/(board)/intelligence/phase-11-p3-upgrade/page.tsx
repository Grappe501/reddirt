import Link from "next/link";
import { Phase11P3UpgradePassPanel } from "@/components/admin/intelligence/Phase11P3UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P3Bar,
  computePhase11P3UpgradePass,
  listStrategyDoctrineArtifactSurfaces,
  STRATEGY_DOCTRINE_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P3Closure";
import { getStrategyDoctrineArtifactOverlay } from "@/lib/intelligence/v4/phase11P3StrategyDoctrineDepth";
import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";

export const dynamic = "force-dynamic";

export default function Phase11P3UpgradePage() {
  const report = computePhase11P3UpgradePass();
  const bar = assertPhase11P3Bar();
  const artifacts = listStrategyDoctrineArtifactSurfaces();
  const registry = loadCampaignStrategicDoctrineRegistry();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P3"
        title="Strategy doctrine JSON command"
        description="Exit gate for surfacing all nine data/strategy-doctrine/ JSON artifacts in intelligence with SDI-1 overlays and strategy alignment crosswalk."
      >
        <V4BackLinks />
        <Link
          href={STRATEGY_DOCTRINE_HUB_HREF}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Strategy doctrine hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Strategy alignment
        </Link>
      </V4PageHeader>

      <Phase11P3UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P3 bar met" : bar.message}
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          Registry: {registry.doctrines.length} doctrine entries · {registry.purpose.slice(0, 120)}…
        </p>
      </section>

      <section className="mb-8 space-y-3">
        {artifacts.map((a) => {
          const overlay = getStrategyDoctrineArtifactOverlay(a.pathKey);
          return (
            <article key={a.pathKey} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
              <Link href={a.href} className="font-bold text-kelly-navy underline">
                {a.title}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">{overlay.strategicRole}</p>
              <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
                {overlay.debateApplication.slice(0, 2).map((line) => (
                  <li key={line.slice(0, 40)}>{line}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}
