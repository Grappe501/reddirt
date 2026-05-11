import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import {
  COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX,
  countyDemocratsHref,
} from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";

export const metadata: Metadata = {
  title: "County Democratic Party · Organizing dashboards",
  description:
    "County party operating system: monthly meetings, P5, events, precinct teams — integrated with the Kelly SOS volunteer platform.",
};

const FEATURED = ["pulaski-county", "washington-county", "benton-county"];

export default function CountyDemocratsHubPage() {
  const featured = FEATURED.map((slug) => ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === slug)).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Volunteer OS · County parties"
        title="County Democratic Party organizing"
        subtitle="A ready-made rhythm: monthly county meetings, Power of 5 turnout networks, voter registration, events, communications, and precinct team launches — interoperable with statewide volunteer workspaces."
      >
        <Button href="/volunteer" variant="outline">
          Volunteer hub
        </Button>
        <Button href="/field-playbook" variant="outline">
          Field playbook
        </Button>
        <Button href="/volunteer/resources/county-party-launch-kit" variant="outline">
          Launch kit
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-8">
          <p className="font-body text-sm text-kelly-text/85">
            Open a county dashboard below. URLs follow{" "}
            <code className="rounded bg-kelly-text/10 px-1 font-mono text-xs">{COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX}/[county-slug]</code>{" "}
            using the same slugs as{" "}
            <Link href="/counties" className="font-semibold text-kelly-blue underline">
              public county pages
            </Link>
            .
          </p>
          <div>
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Featured counties</h2>
            <ul className="mt-3 space-y-2">
              {featured.map((c) =>
                c ? (
                  <li key={c.slug}>
                    <Link
                      href={countyDemocratsHref(c.slug, "")}
                      className="block rounded-xl border border-kelly-text/10 bg-white p-4 font-body text-sm font-semibold text-kelly-navy shadow-sm hover:border-kelly-navy/25"
                    >
                      {c.displayName} · Open dashboard →
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
          <p className="font-body text-xs text-kelly-text/60">
            Automation: scheduling a monthly meeting (with database connected) creates campaign calendar events and workbench tasks;
            email invitations and reminders link through Email Command Center / Message Studio in a later operator pass.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
