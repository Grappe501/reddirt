import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { VOS_CAMPAIGN_INTENT } from "@/lib/campaign-ops/events-workflow-intents";
import { VOLUNTEER_RESOURCES } from "@/lib/volunteer-resources";

export const metadata: Metadata = {
  title: "Events lane · Operating manual · Volunteer resources",
  description:
    "House parties, county fundraisers, weekend immersions, two-day city visits, faith communities, festivals, travel rhythm, and event follow-up templates for Events coordinators and hosts.",
};

function IntentCallout() {
  return (
    <div className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
      <h3 className="font-heading text-base font-bold text-kelly-navy">Automation intents (Action Queue)</h3>
      <p className="mt-2 font-body text-sm text-kelly-text/85">
        When staff create events in Admin, set <span className="font-mono text-xs">CampaignEvent.campaignIntent</span> so
        specialized tasks spawn (in addition to generic appearance prep for applicable types):
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 font-mono text-xs text-kelly-deep">
        <li>
          <code>{VOS_CAMPAIGN_INTENT.houseParty}</code> — MEETING (house party path)
        </li>
        <li>
          <code>{VOS_CAMPAIGN_INTENT.countyFundraiser}</code> — FUNDRAISER (county objective)
        </li>
        <li>
          <code>{VOS_CAMPAIGN_INTENT.weekendImmersion}</code> — TRAINING (weekend grid convention)
        </li>
        <li>
          <code>{VOS_CAMPAIGN_INTENT.faithCommunityVisit}</code> — MEETING (faith visit protocol)
        </li>
      </ul>
    </div>
  );
}

function AnchorSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
      <div className="mt-3 space-y-3 font-body text-sm text-kelly-text/85">{children}</div>
    </section>
  );
}

export default function EventsLaneResourceHubPage() {
  const items = VOLUNTEER_RESOURCES.filter((r) => r.category === "events-lane-toolkits");

  return (
    <>
      <PageHero
        eyebrow="Volunteers · Events lane"
        title="Events operating manual"
        subtitle="From “I want to help with events” to “I can host, train hosts, and stack a two-day city visit without HQ babysitting.” Use field playbooks for depth; this hub is your table of contents."
      >
        <Button href="/field-playbook/roles/events-coordinator" variant="outline">
          Events coordinator guide
        </Button>
        <Button href="/field-playbook/roles/events-hosting-playbook" variant="outline">
          Hosting playbook
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-8">
          <IntentCallout />

          <AnchorSection id="toolkits" title="Toolkits & planners">
            <p>Each item opens the canonical web playbook (print-friendly in the browser).</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {items.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="font-semibold text-kelly-blue hover:underline">
                    {r.title}
                  </Link>
                  <span className="text-kelly-text/75"> — {r.description}</span>
                </li>
              ))}
            </ul>
          </AnchorSection>

          <AnchorSection id="county-fundraising" title="County fundraising objective (through September)">
            <p>
              Every county should aim for <strong>at least one</strong> fundraising event between now and September — more when
              hosts and compliance capacity allow. Track county, host, date, goal, invites, RSVP, raised, and follow-up in the{" "}
              <Link href="/field-playbook/roles/fundraising-receptions-county" className="font-semibold text-kelly-blue underline">
                Fundraising Event Toolkit
              </Link>
              .
            </p>
          </AnchorSection>

          <AnchorSection id="weekend-immersion" title="Weekend Community Immersion (repeatable)">
            <p>
              Four to five ~45 minute home meet-and-greets anchored to a larger local event — see{" "}
              <Link href="/field-playbook/roles/weekend-community-immersion" className="font-semibold text-kelly-blue underline">
                Weekend Community Immersion
              </Link>
              . Pair coffee, lunch, faith, and student blocks from the{" "}
              <Link href="/field-playbook/roles/two-day-city-immersion" className="font-semibold text-kelly-blue underline">
                two-day city model
              </Link>
              .
            </p>
          </AnchorSection>

          <AnchorSection id="travel-rhythm" title="Travel rhythm">
            <p>
              Sustainable defaults for home nights and return buffers —{" "}
              <Link href="/field-playbook/roles/travel-rhythm-model" className="font-semibold text-kelly-blue underline">
                Travel rhythm model
              </Link>
              .
            </p>
          </AnchorSection>

          <AnchorSection id="faith" title="Faith communities">
            <p>
              Checklist: leader ID → contact → request → scheduled → follow-up. Read{" "}
              <Link href="/field-playbook/roles/faith-community-visits" className="font-semibold text-kelly-blue underline">
                Faith community visits
              </Link>
              .
            </p>
          </AnchorSection>

          <AnchorSection id="follow-up-templates" title="Event follow-up templates (email)">
            <p>
              Copy-ready shells:{" "}
              <Link href="/volunteer/resources/email-templates#event-follow-up-host" className="font-semibold text-kelly-blue underline">
                Host thank-you
              </Link>
              ,{" "}
              <Link href="/volunteer/resources/email-templates#event-follow-up-attendee" className="font-semibold text-kelly-blue underline">
                Attendee follow-up
              </Link>
              ,{" "}
              <Link href="/volunteer/resources/email-templates#event-fundraising-thanks" className="font-semibold text-kelly-blue underline">
                Fundraising thank-you
              </Link>
              .
            </p>
          </AnchorSection>

          <AnchorSection id="cross-lane" title="Other lanes (hardening pass)">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <Link href="/field-playbook/roles/social-advanced-local-press" className="font-semibold text-kelly-blue underline">
                  Social · local media & press graphics
                </Link>
              </li>
              <li>
                <Link href="/field-playbook/roles/p5-vr-event-operations" className="font-semibold text-kelly-blue underline">
                  P5 / VR · registration events & polling readiness
                </Link>
              </li>
              <li>
                <Link href="/field-playbook/roles/youth-semester-campus-execution" className="font-semibold text-kelly-blue underline">
                  Youth · semester & campus challenges
                </Link>
              </li>
              <li>
                <Link href="/field-playbook/roles/womens-outreach-execution" className="font-semibold text-kelly-blue underline">
                  Women&apos;s Outreach · family & listening sessions
                </Link>
              </li>
              <li>
                <Link
                  href="/field-playbook/coordination/community-region-leadership"
                  className="font-semibold text-kelly-blue underline"
                >
                  Community region leadership training
                </Link>
              </li>
            </ul>
          </AnchorSection>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
