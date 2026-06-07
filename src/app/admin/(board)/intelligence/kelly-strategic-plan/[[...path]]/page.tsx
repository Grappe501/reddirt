import Link from "next/link";
import { notFound } from "next/navigation";
import { KellyStrategicPlanChapterPanel } from "@/components/admin/intelligence/kelly-strategic-plan/KellyStrategicPlanChapterPanel";
import { Phase11P1UpgradePassPanel } from "@/components/admin/intelligence/Phase11P1UpgradePassPanel";
import { StrategyMarkdownArticle } from "@/components/admin/campaign-strategy/StrategyMarkdownArticle";
import { StrategyMarkdownReadError } from "@/components/admin/campaign-strategy/StrategyMarkdownReadError";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { KELLY_STRATEGIC_PLAN_HUB_HREF } from "@/lib/campaign-strategy/kelly-strategic-plan-nav";
import { loadStrategyMarkdown } from "@/lib/campaign-strategy/load-strategy-md";
import { getKellyStrategicPlanChapterOverlay } from "@/lib/intelligence/v4/phase11KellyStrategicPlanDepth";
import {
  computePhase11P1UpgradePass,
  listKellyStrategicPlanChapterSurfaces,
} from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { kellyStrategicPlanDocHref } from "@/lib/campaign-strategy/kelly-strategic-plan-nav";
import { getStrategyDoc } from "@/lib/campaign-strategy/registry";
import { StrategyArticle } from "@/components/admin/campaign-strategy/StrategyArticle";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function KellyStrategicPlanHub() {
  const report = computePhase11P1UpgradePass();
  const chapters = listKellyStrategicPlanChapterSurfaces();
  const bySection = {
    foundation: chapters.filter((c) => c.section === "foundation"),
    programs: chapters.filter((c) => c.section === "programs"),
    operations: chapters.filter((c) => c.section === "operations"),
  };

  return (
    <>
      <V4PageHeader
        eyebrow="Intelligence · Phase 11 P1"
        title="Kelly SOS strategic plan — chapter command"
        description="All 22 manual chapters in the intelligence tree with debate application overlays, operator steps, and philosophy crosswalks on every chapter."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy hub
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p1-upgrade"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          P1 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P1UpgradePassPanel report={report} />

      {(["foundation", "programs", "operations"] as const).map((section) => (
        <section key={section} className="mb-8 rounded-xl border border-kelly-navy/10 bg-white p-5">
          <h2 className="font-heading text-lg font-bold capitalize text-kelly-navy">{section}</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {bySection[section].map((ch) => (
              <li key={ch.pathKey} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
                <Link href={ch.href} className="font-semibold text-kelly-navy underline">
                  {ch.title}
                </Link>
                <p className="mt-0.5 text-[10px] text-kelly-muted">
                  {ch.phase11P1Enriched ? "P1 enriched" : "needs overlay"} · {ch.file}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default async function KellyStrategicPlanCatchAllPage({ params }: Props) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return <KellyStrategicPlanHub />;
  }

  const pathKey = path.join("/");
  const overlay = getKellyStrategicPlanChapterOverlay(pathKey);

  const loaded = await loadStrategyMarkdown(pathKey);
  if (loaded.kind === "doc") {
    return (
      <>
        <KellyStrategicPlanChapterPanel overlay={overlay} />
        <StrategyMarkdownArticle
          pathKey={pathKey}
          markdown={loaded.markdown}
          sourceFile={loaded.sourceFile}
          readerBaseHref={KELLY_STRATEGIC_PLAN_HUB_HREF}
        />
      </>
    );
  }
  if (loaded.kind === "error") {
    return (
      <StrategyMarkdownReadError pathKey={pathKey} sourceFile={loaded.sourceFile} message={loaded.message} />
    );
  }

  const doc = getStrategyDoc(pathKey);
  if (!doc) notFound();

  return (
    <>
      <KellyStrategicPlanChapterPanel overlay={overlay} />
      <StrategyArticle doc={doc} pathKey={pathKey} />
    </>
  );
}
