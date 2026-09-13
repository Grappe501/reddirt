import type { Metadata } from "next";
import { SiteAnalyticsWorkbench } from "@/components/admin/SiteAnalyticsWorkbench";
import { loadSiteTrafficSnapshot, parseTrafficWindowDays } from "@/lib/analytics/site-traffic";
import { buildSiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import { describeOpenAIKeySource, getOpenAIKeySource, isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export const metadata: Metadata = {
  title: "Visitor analytics",
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
    <div>
      <p className="mb-4 font-body text-xs text-kelly-muted">
        OpenAI: {openaiReady ? `ready (${describeOpenAIKeySource(getOpenAIKeySource())})` : "not configured"}
      </p>
      <SiteAnalyticsWorkbench
        snapshot={loaded.snapshot}
        intel={intel}
        openaiReady={openaiReady}
        readError={loaded.readError}
        newestEventAt={loaded.newestEventAt}
      />
    </div>
  );
}
