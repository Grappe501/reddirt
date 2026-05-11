import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX } from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { MUSLIM_COMMUNITY_DASHBOARD_BASE } from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Community regions · Dashboard hub",
  description: "Community-native organizing dashboards — Muslim Community Region first; Spanish and Marshallese scaffolds.",
};

const cards = [
  {
    href: MUSLIM_COMMUNITY_DASHBOARD_BASE,
    title: "Muslim Community Region",
    body: "Launch-ready shell: Overview, lanes, mosque polling readiness, resources, rollup — draft labels for partner review.",
    status: "Active",
  },
  {
    href: COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX,
    title: "County Democratic Party organizing",
    body: "Per-county dashboard: monthly meeting → calendar + Action Queue, P5/VR, precinct triads, resources, and rollup KPIs aligned with the Volunteer OS.",
    status: "Active",
  },
  {
    href: "/dashboard/community/conversational-spanish",
    title: "Conversational Spanish",
    body: "Scaffold — architecture aligns with Muslim Community pattern after P1 launch.",
    status: "Scaffold",
  },
  {
    href: "/dashboard/community/marshallese",
    title: "Marshallese",
    body: "Scaffold — architecture aligns with Muslim Community pattern after P1 launch.",
    status: "Scaffold",
  },
] as const;

export default function CommunityRegionsHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer OS · Community regions"
        title="Community region dashboards"
        subtitle="Geographic triads use team workspaces; identity- and community-native regions use the same lane discipline with partner-shaped leadership and resources."
      >
        <Button href="/volunteer" variant="outline">
          Volunteer hub
        </Button>
        <Button href="/field-playbook" variant="outline">
          Field playbook
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-6">
          <ul className="space-y-4">
            {cards.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-heading text-lg font-bold text-kelly-navy">{c.title}</h2>
                    <span className="rounded-md bg-kelly-fog px-2 py-0.5 font-body text-[10px] font-bold uppercase text-kelly-deep">
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-sm text-kelly-text/80">{c.body}</p>
                  <span className="mt-3 inline-block font-body text-sm font-semibold text-kelly-blue">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
