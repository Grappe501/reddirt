import type { Metadata } from "next";
import { SiteAnalyticsWorkbench } from "@/components/admin/SiteAnalyticsWorkbench";
import { loadSiteTrafficSnapshot, parseTrafficWindowDays } from "@/lib/analytics/site-traffic";
import { describeOpenAIKeySource, getOpenAIKeySource, isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

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
  const snapshot = await loadSiteTrafficSnapshot(days);
  const openaiReady = isOpenAIConfigured();

  return (
    <div>
      <p className="mb-4 font-body text-xs text-kelly-muted">
        OpenAI: {openaiReady ? `ready (${describeOpenAIKeySource(getOpenAIKeySource())})` : "not configured"}
      </p>
      <SiteAnalyticsWorkbench snapshot={snapshot} openaiReady={openaiReady} />
    </div>
  );
}
