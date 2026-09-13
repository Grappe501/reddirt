import type { Metadata } from "next";
import { SiteAnalyticsLiveDesk } from "@/components/admin/SiteAnalyticsLiveDesk";
import { loadSiteTrafficSnapshot, parseTrafficWindowDays } from "@/lib/analytics/site-traffic";
import { buildSiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import { isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export const metadata: Metadata = {
  title: "Flight deck",
  robots: { index: false, follow: false },
};

export default async function SiteAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = parseTrafficWindowDays(sp.days);
  const loaded = await loadSiteTrafficSnapshot(days);
  const intel = buildSiteTrafficIntelligence(loaded.snapshot);
  const openaiReady = isOpenAIConfigured();

  return (
    <SiteAnalyticsLiveDesk
      snapshot={loaded.snapshot}
      intel={intel}
      openaiReady={openaiReady}
      readError={loaded.readError}
      newestEventAt={loaded.newestEventAt}
    />
  );
}
