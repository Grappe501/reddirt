import Link from "next/link";
import { Phase3UpgradePassPanel } from "@/components/admin/intelligence/Phase3UpgradePassPanel";
import { DebateSpineFiveLayerChrome } from "@/components/admin/intelligence/DebateSpineFiveLayerChrome";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  COMMAND_SURFACE_FIVE_LAYERS,
  computePhase3UpgradePass,
  PHASE_3_WAVES,
} from "@/lib/intelligence/v4/phase3DebateSpineDepth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase3UpgradePage() {
  const report = computePhase3UpgradePass();
  const sampleTrap = COMMAND_SURFACE_FIVE_LAYERS["film-room"];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 3"
        title="Page-by-page depth waves"
        description="Six waves across the debate spine — every page ships five layers: orientation, narrative, evidence table, operator scripts, and gates."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-kelly-navy/25 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/supreme-workbench"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Supreme workbench
        </Link>
      </V4PageHeader>

      <Phase3UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">The five-layer standard</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>
            <span className="font-bold text-kelly-text">Orientation</span> — why this page exists (debate vs clerk vs
            staff)
          </li>
          <li>
            <span className="font-bold text-kelly-text">Narrative</span> — 4+ paragraphs: context, stakes, opponent angle
          </li>
          <li>
            <span className="font-bold text-kelly-text">Evidence table</span> — claim, tier, source URL, counsel flag
          </li>
          <li>
            <span className="font-bold text-kelly-text">Operator block</span> — 30s / 60s / 90s scripts + delivery notes
          </li>
          <li>
            <span className="font-bold text-kelly-text">Gates</span> — claims firewall, diligence incomplete frame,
            Pakko contrast
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Wave catalog</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PHASE_3_WAVES.map((wave) => {
            const progress = report.waves.find((w) => w.id === wave.id)!;
            return (
              <Link
                key={wave.id}
                href={wave.hubHref}
                className="rounded-xl border-2 border-kelly-navy/10 p-4 hover:border-kelly-navy/30"
              >
                <p className="text-[10px] font-bold uppercase text-kelly-subtle">{wave.label}</p>
                <p className="mt-1 font-bold text-kelly-navy">{wave.description}</p>
                <p className="mt-2 text-2xl font-bold text-violet-950">{progress.pct}%</p>
                <p className="text-xs text-kelly-muted">
                  {progress.atBar}/{progress.total} routes at bar · ~{wave.routeCount} in wave
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {sampleTrap ? (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase text-kelly-navy">Sample — film room five-layer chrome</h2>
          <DebateSpineFiveLayerChrome depth={sampleTrap} />
        </section>
      ) : null}
    </div>
  );
}
