import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";

import { VOLUNTEER_RESOURCES } from "@/lib/volunteer-resources";

export const metadata: Metadata = {
  title: "Team Launch Kit · Volunteer resources",
  description:
    "Launch checklists, invite templates, P5 worksheets, weekly huddles, events, messaging, GOTV readiness, and downstream placement.",
};

export default function TeamLaunchKitPage() {
  const items = VOLUNTEER_RESOURCES.filter((r) => r.category === "team-launch-kit");

  return (
    <>
      <PageHero
        eyebrow="Volunteers"
        title="Team Launch Kit"
        subtitle="Everything a triad needs to recruit, onboard, train, and hand off downstream teams without waiting on daily HQ babysitting."
      >
        <Button href="/field-playbook/overview/self-building-team-system" variant="outline">
          Self-Building doctrine
        </Button>
        <Button href="/volunteer/resources" variant="outline">
          Full library
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-4">
          <p className="font-body text-sm text-kelly-text/85">
            Use this hub with your weekly huddle and governance checklist on the team dashboard. Train as you grow — when you
            launch downstream, walk the new triad through the same kit.
          </p>
          <ul className="space-y-3">
            {items.map((r) => (
              <li key={r.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3 shadow-sm">
                {r.comingSoon ? (
                  <span className="font-heading text-base font-bold text-kelly-navy">{r.title}</span>
                ) : (
                  <Link href={r.href} className="font-heading text-base font-bold text-kelly-navy hover:text-kelly-blue">
                    {r.title}
                  </Link>
                )}
                {r.comingSoon ? (
                  <span className="ml-2 rounded-full bg-kelly-text/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-kelly-text/70">
                    Coming soon
                  </span>
                ) : null}
                <p className="mt-1 font-body text-sm text-kelly-text/75">{r.description}</p>
                {r.comingSoon ? (
                  <p className="mt-1 font-mono text-[10px] text-kelly-text/45">{r.href}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
