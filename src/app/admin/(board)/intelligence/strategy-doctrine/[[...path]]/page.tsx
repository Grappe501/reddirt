import Link from "next/link";
import { notFound } from "next/navigation";
import { Phase11P3UpgradePassPanel } from "@/components/admin/intelligence/Phase11P3UpgradePassPanel";
import { StrategyDoctrineArtifactPanel } from "@/components/admin/intelligence/strategy-doctrine/StrategyDoctrineArtifactPanel";
import { StrategyDoctrineJsonViewer } from "@/components/admin/intelligence/strategy-doctrine/StrategyDoctrineJsonViewer";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadStrategyDoctrineJson } from "@/lib/strategy-doctrine/load-strategy-doctrine-json";
import { findStrategyDoctrineEntry } from "@/lib/strategy-doctrine/strategy-doctrine-nav";
import { getStrategyDoctrineArtifactOverlay } from "@/lib/intelligence/v4/phase11P3StrategyDoctrineDepth";
import {
  computePhase11P3UpgradePass,
  listStrategyDoctrineArtifactSurfaces,
} from "@/lib/intelligence/v4/phase11P3Closure";
import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function StrategyDoctrineHub() {
  const report = computePhase11P3UpgradePass();
  const artifacts = listStrategyDoctrineArtifactSurfaces();
  const registry = loadCampaignStrategicDoctrineRegistry();
  const byCategory = artifacts.reduce(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    },
    {} as Record<string, typeof artifacts>,
  );

  return (
    <>
      <V4PageHeader
        eyebrow="Intelligence · SDI-1 · Phase 11 P3"
        title="Strategy doctrine JSON — artifact command"
        description="Nine read-only JSON artifacts from data/strategy-doctrine/ with P3 overlays — debate application, alignment use, and review gates on every file."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Strategy alignment
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p3-upgrade"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          P3 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P3UpgradePassPanel report={report} compact />

      <section className="mb-6 rounded-xl border border-amber-100 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Registry summary</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          {registry.doctrines.length} doctrine entries indexed · version {registry.registryVersion}
        </p>
      </section>

      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category} className="mb-8 rounded-xl border border-kelly-navy/10 bg-white p-5">
          <h2 className="font-heading text-lg font-bold capitalize text-kelly-navy">{category}</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {items.map((a) => (
              <li key={a.pathKey} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
                <Link href={a.href} className="font-semibold text-kelly-navy underline">
                  {a.title}
                </Link>
                <p className="mt-0.5 text-[10px] text-kelly-muted">
                  {a.phase11P3Enriched ? "P3 enriched" : "needs overlay"} · {a.sourceFile}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default async function StrategyDoctrineCatchAllPage({ params }: Props) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return <StrategyDoctrineHub />;
  }

  const pathKey = path.join("/");
  if (!findStrategyDoctrineEntry(pathKey)) notFound();

  const overlay = getStrategyDoctrineArtifactOverlay(pathKey);
  const loaded = await loadStrategyDoctrineJson(pathKey);

  if (loaded.kind === "doc") {
    return (
      <>
        <StrategyDoctrineArtifactPanel overlay={overlay} />
        <StrategyDoctrineJsonViewer pathKey={pathKey} raw={loaded.raw} sourceFile={loaded.sourceFile} />
      </>
    );
  }

  notFound();
}
