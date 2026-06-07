import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignSystemMarkdownArticle } from "@/components/admin/intelligence/campaign-system/CampaignSystemMarkdownArticle";
import {
  CampaignSystemCategoryGuidePanel,
  Phase11UpgradePassPanel,
} from "@/components/admin/intelligence/Phase11UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildCampaignSystemManualInventory, listCampaignSystemCategoryGuides } from "@/lib/intelligence/v4/campaignSystemManualInventory";
import { computePhase11UpgradePass } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import { loadCampaignSystemMarkdown } from "@/lib/campaign-strategy/load-campaign-system-md";
import { campaignSystemDocHref } from "@/lib/campaign-strategy/campaign-system-nav";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function CampaignSystemHub() {
  const report = await computePhase11UpgradePass();
  const inventory = await buildCampaignSystemManualInventory();
  const guides = listCampaignSystemCategoryGuides();

  return (
    <>
      <V4PageHeader
        eyebrow="Intelligence · Phase 11 · P0"
        title="Campaign system manual — inventory & reader"
        description="252 operational documents surfaced in intelligence. Browse by category, open priority tomes, cross-link to strategy command — no longer agent-chunks only."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy hub
        </Link>
        <Link
          href="/admin/intelligence/phase-11-upgrade"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Phase 11 pass
        </Link>
      </V4PageHeader>

      <Phase11UpgradePassPanel report={report} />

      <CampaignSystemCategoryGuidePanel guides={guides} />

      <section className="mb-8 space-y-6">
        {inventory.nav.map((section) => (
          <div key={section.id} className="rounded-xl border border-kelly-navy/10 bg-white p-5">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">
              <a href={`#${section.id}`} className="hover:underline">
                {section.title}
              </a>{" "}
              <span className="text-sm font-normal text-kelly-muted">({section.items.length})</span>
            </h2>
            <ul className="mt-3 grid gap-1 md:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.pathKey}>
                  <Link
                    href={campaignSystemDocHref(item.pathKey)}
                    className="text-sm font-medium text-kelly-navy hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

export default async function CampaignSystemManualCatchAllPage({ params }: Props) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return <CampaignSystemHub />;
  }

  const pathKey = path.join("/");
  const loaded = await loadCampaignSystemMarkdown(pathKey);
  if (loaded.kind === "absent") {
    notFound();
  }
  if (loaded.kind === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p className="font-bold">Read error</p>
        <p className="mt-1">{loaded.message}</p>
        <p className="mt-1 text-xs">{loaded.sourceFile}</p>
      </div>
    );
  }

  return (
    <CampaignSystemMarkdownArticle
      pathKey={loaded.pathKey}
      markdown={loaded.markdown}
      sourceFile={loaded.sourceFile}
    />
  );
}
