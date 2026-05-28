import Link from "next/link";
import { notFound } from "next/navigation";
import { KimHammerBriefingPageShell } from "../../KimHammerBriefingPageShell";
import { KimHammerCountyBriefingPanel } from "../../KimHammerCountyBriefingPanel";
import { resolveCountyBriefingIntelligence } from "@/lib/intelligence/countyBriefingIntelligence";
import { resolveCountyMediaMarketProfile } from "@/lib/intelligence/mediaMarketIntelligence";

type Props = {
  params: Promise<{ countyId: string }>;
};

export default async function KimHammerCountyBriefingDetailPage({ params }: Props) {
  const { countyId } = await params;
  const briefing = resolveCountyBriefingIntelligence(countyId);
  if (!briefing) notFound();
  const mediaProfile = resolveCountyMediaMarketProfile(countyId);

  return (
    <KimHammerBriefingPageShell moduleId="county-briefings">
      <header className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{briefing.region}</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">{briefing.countyName}</h1>
        <p className="mt-2 text-xs text-kelly-muted">
          County-specific opposition research, civic intelligence, and doctrine-aware messaging guidance.
        </p>
        <Link
          href="/admin/intelligence/kim-hammer/county-briefings"
          className="mt-2 inline-block text-xs font-semibold text-kelly-navy underline"
        >
          ← All county briefings
        </Link>
      </header>

      <KimHammerCountyBriefingPanel briefing={briefing} mediaProfile={mediaProfile} />
    </KimHammerBriefingPageShell>
  );
}
