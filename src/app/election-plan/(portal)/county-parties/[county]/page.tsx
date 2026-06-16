import { notFound } from "next/navigation";

import { CountyPartyIntelligencePanel } from "@/components/election-plan/CountyPartyIntelligencePanel";
import { PageBrief } from "@/components/election-plan/PageBrief";
import { getCountyPartyProfileBySlug } from "@/lib/election-plan/load-county-party-intelligence";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { countyPartiesHubHref } from "@/lib/election-plan/load-county-party-intelligence";
import Link from "next/link";

type Props = { params: Promise<{ county: string }> };

export async function generateStaticParams() {
  const { getCountyPartyProfiles } = await import("@/lib/election-plan/load-county-party-intelligence");
  return getCountyPartyProfiles().map((p) => ({ county: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { county } = await params;
  const profile = getCountyPartyProfileBySlug(county);
  return {
    title: profile ? `${profile.county} County Party | Election Plan` : "County Party",
    robots: { index: false, follow: false },
  };
}

export default async function CountyPartyDetailPage({ params }: Props) {
  const { county } = await params;
  const profile = getCountyPartyProfileBySlug(county);
  if (!profile) notFound();

  return (
    <>
      <div className="ep-classification">Phase 18.7I · {profile.county} County Party · ArkDems public data</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href={countyPartiesHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← All county parties
          </Link>
          <PageBrief
            brief={{
              id: `county-party-${profile.slug}`,
              title: `${profile.county} County Democratic Party`,
              answers: "Who chairs the county party? When do they meet? What is the recommended outreach action?",
              keyMetrics: ["County chair", "Meeting rule", "Next proposed dates", "Verification status"],
              bestFor: ["Field team", "County captains", "Kelly · surrogates", "Coalition lead"],
              relatedLinks: [
                { label: "County playbook", href: countyPlaybookHref(profile.county, profile.slug) },
                { label: "All county parties", href: countyPartiesHubHref() },
              ],
            }}
          />
          <CountyPartyIntelligencePanel profile={profile} />
        </div>
      </div>
    </>
  );
}
