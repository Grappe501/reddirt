import type { Metadata } from "next";
import Link from "next/link";

import { FieldCommunityPartnerDashboards } from "@/components/dashboard/field/FieldCommunityPartnerDashboards";
import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import { ARKANSAS_COMMAND_REGIONS } from "@/lib/county/arkansas-county-registry";
import { fieldDirectorHref, fieldRegionHref } from "@/lib/field-structure/field-dashboard-paths";
import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

export const metadata: Metadata = {
  title: "Field Director · Dashboard",
  description:
    "Field leadership hub — statewide leads, community partner dashboards, and Arkansas regions as teams come online.",
};

export default function FieldDirectorPage() {
  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Team workspace", href: `/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}` },
          { label: "Field Director" },
        ]}
      />
      <div className="space-y-8">
        <header>
          <h2 className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">Field Director</h2>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
            This hub links to the three statewide functional leads (social & media, Power of 5 / voter registration, and
            events) and every regional command board. Regions roll up to campaign leadership; counties inherit the same
            three lanes; cities, precincts, and neighborhoods chain beneath counties as teams spin up.
          </p>
        </header>

        <section aria-labelledby="lead-dash">
          <h3 id="lead-dash" className="font-heading text-lg font-bold text-kelly-text">
            Statewide functional leads
          </h3>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                href: `${fieldDirectorHref()}/leads/social-media`,
                title: "Lead · Social & media",
                text: "Press, owned social, and local amplification — cross-region view (template).",
              },
              {
                href: `${fieldDirectorHref()}/leads/power-of-5`,
                title: "Lead · Power of 5 / VR",
                text: "Registration goals and relational Power of 5 cadence — statewide coordination view.",
              },
              {
                href: `${fieldDirectorHref()}/leads/events`,
                title: "Lead · Events",
                text: "Field calendar, tabling, and immersion rhythm — statewide coordination view.",
              },
            ].map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block h-full rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-sm transition hover:border-kelly-navy/30"
                >
                  <h4 className="font-heading text-base font-bold text-kelly-navy">{c.title}</h4>
                  <p className="mt-2 font-body text-sm text-kelly-text/75">{c.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="field-fundraising" className="rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-sm md:p-6">
          <h3 id="field-fundraising" className="font-heading text-lg font-bold text-kelly-text">
            Fundraising lane · Week 4 maturity
          </h3>
          <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
            Fundraising is modeled under the Events lane until dedicated finance teams spin out. Teams see the full workspace once
            Volunteer OS maturity reaches Expand / Lead levels — start small, stay local, and keep compliance in the loop.
          </p>
          <p className="mt-4">
            <Link
              href={`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}/fundraising`}
              className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Open sample team fundraising workspace →
            </Link>
          </p>
        </section>

        <FieldCommunityPartnerDashboards />

        <section aria-labelledby="regions">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 id="regions" className="font-heading text-lg font-bold text-kelly-text">
              Drill down · Arkansas regions
            </h3>
            <Link
              href={`${fieldDirectorHref()}/regions`}
              className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Open full region index →
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARKANSAS_COMMAND_REGIONS.map((r) => (
              <li key={r.id}>
                <Link
                  href={fieldRegionHref(r.id)}
                  className="flex flex-col rounded-xl border border-kelly-text/10 bg-kelly-fog/20 px-4 py-3 font-body text-sm transition hover:border-kelly-navy/25 hover:bg-white"
                >
                  <span className="font-bold text-kelly-navy">{r.shortLabel}</span>
                  <span className="mt-1 text-xs text-kelly-text/70">{r.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
