import { notFound } from "next/navigation";
import Link from "next/link";

import { CountyPartyIntelligencePanel } from "@/components/election-plan/CountyPartyIntelligencePanel";
import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import { PageBrief } from "@/components/election-plan/PageBrief";
import {
  countyPartiesHubHref,
  getCountyPartyProfileBySlug,
  getCountyPartyProfiles,
} from "@/lib/election-plan/load-county-party-intelligence";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { getDpaOfficerOrg, getDpaOfficerOrgs } from "@/lib/election-plan/load-dpa-county-officers";

type Props = { params: Promise<{ county: string }> };

export async function generateStaticParams() {
  const profiles = getCountyPartyProfiles().map((p) => p.slug);
  const orgs = getDpaOfficerOrgs().map((o) => o.orgSlug);
  return [...new Set([...profiles, ...orgs])].map((county) => ({ county }));
}

export async function generateMetadata({ params }: Props) {
  const { county } = await params;
  const org = getDpaOfficerOrg(county);
  const profile = getCountyPartyProfileBySlug(county);
  const title = org?.orgName ?? (profile ? `${profile.county} County Party` : "County Party");
  return {
    title: `${title} | Election Plan`,
    robots: { index: false, follow: false },
  };
}

export default async function CountyPartyDetailPage({ params }: Props) {
  const { county } = await params;
  const profile = getCountyPartyProfileBySlug(county);
  const org = getDpaOfficerOrg(county);
  if (!profile && !org) notFound();

  const title = org?.orgName ?? `${profile!.county} County Democratic Party`;
  const relatedLinks = [
    ...(profile ? [{ label: "County playbook", href: countyPlaybookHref(profile.county, profile.slug) }] : []),
    { label: "All county parties", href: countyPartiesHubHref() },
  ];

  return (
    <>
      <div className="ep-classification">
        Phase 18.7I · {title} · DPA officer list{profile ? " · ArkDems meeting page" : ""}
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href={countyPartiesHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← All county parties
          </Link>
          <PageBrief
            brief={{
              id: `county-party-${org?.orgSlug ?? profile!.slug}`,
              title,
              answers: "Who are the officers? How do we reach them for events? When does the county party meet?",
              keyMetrics: ["Officer roster", "Chair contact", "Meeting rule", "Event booking"],
              bestFor: ["Field team", "County captains", "Kelly · surrogates", "Events lead"],
              relatedLinks,
            }}
          />
          {org && !profile ? <CountyPartyOfficerRoster orgs={[org]} variant="full" title="Officer roster" /> : null}
          {profile ? <CountyPartyIntelligencePanel profile={profile} /> : null}
        </div>
      </div>
    </>
  );
}
