import Link from "next/link";
import { notFound } from "next/navigation";
import { ARKANSAS_CAMPAIGN_REGIONS, getCampaignRegionBySlug, type ArkansasCampaignRegionSlug } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

const ALLOWED = new Set<ArkansasCampaignRegionSlug>(ARKANSAS_CAMPAIGN_REGIONS.map((r) => r.slug));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!ALLOWED.has(slug as ArkansasCampaignRegionSlug)) return { title: "Region" };
  const r = getCampaignRegionBySlug(slug as ArkansasCampaignRegionSlug);
  if (!r) return { title: "Region" };
  return pageMeta({
    title: `${r.displayName} — Arkansas organizing intelligence (preview)`,
    description: `Preview route for ${r.displayName}. Prefer the dedicated regional dashboard when linked from the statewide view. Demo-only content; no private voter data.`,
    path: `/organizing-intelligence/regions/${slug}`,
    imageSrc: "/media/placeholders/og-default.svg",
  });
}

/**
 * Placeholder: prevents 404s from the state grid until full region drills ship.
 */
export default async function OrganizingIntelligenceRegionPlaceholderPage({ params }: Props) {
  const { slug } = await params;
  if (!ALLOWED.has(slug as ArkansasCampaignRegionSlug)) notFound();
  const r = getCampaignRegionBySlug(slug as ArkansasCampaignRegionSlug);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-kelly-text">
      <p className="text-sm text-kelly-text/60">
        <Link className="text-kelly-slate underline" href="/organizing-intelligence">
          ← State organizing intelligence
        </Link>
      </p>
      <h1 className="font-heading mt-4 text-2xl font-bold text-kelly-navy">{r.displayName}</h1>
      <p className="mt-2 text-sm text-kelly-text/75">Region dashboard route — <strong>placeholder</strong> only. No region rollup UI yet; demo/seed TBD per packet.</p>
      {r.notes ? <p className="mt-3 rounded-lg border border-kelly-text/10 bg-kelly-page/80 p-3 text-sm text-kelly-text/70">{r.notes}</p> : null}
      <p className="mt-4 text-sm text-kelly-text/60">
        Sample county:{" "}
        <Link className="font-semibold text-kelly-slate underline" href="/county-briefings/pope/v2">
          Pope v2
        </Link>
      </p>
    </div>
  );
}
