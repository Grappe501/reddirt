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
  description: "Community-native organizing dashboards — Muslim Community Region first; Spanish and Marshallese hubs expanding.",
};

const cards = [
  {
    href: MUSLIM_COMMUNITY_DASHBOARD_BASE,
    title: "Muslim Community Region",
    body: "Overview, lanes, mosque polling readiness, resources, and rollup — materials expand as they are ready to share.",
    status: "Active",
  },
  {
    href: COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX,
    title: "County Democratic Party organizing",
    body: "Per-county dashboard: monthly meeting, Power of 5 / VR, precinct triads, resources, and rollup KPIs aligned with the Volunteer Operating System.",
    status: "Active",
  },
  {
    href: "/dashboard/community/conversational-spanish",
    title: "Conversational Spanish",
    body: "Reserved for Spanish-first civic organizing with the same triad discipline. Lane modules expand as partner materials are ready.",
    status: "In review",
  },
  {
    href: "/dashboard/community/marshallese",
    title: "Marshallese",
    body: "Reserved for Marshallese civic partners statewide. Content and KPIs deepen after community leadership alignment.",
    status: "In review",
  },
] as const;

export default function CommunityRegionsHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Community regions"
        title="Community region dashboards"
        subtitle="Geographic triads use team workspaces; identity- and community-native regions use the same lane discipline with partner-shaped leadership and resources."
      >
        <Button href="/dashboard/field" variant="primary">
          Field Director dashboard
        </Button>
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
