import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { VOLUNTEER_RESOURCES } from "@/lib/volunteer-resources";

export const metadata: Metadata = {
  title: "County Party Launch Kit · Volunteer resources",
  description:
    "Monthly meeting rhythm, P5 outreach, precinct triads, voter registration toolkit, and communications for county Democratic party leadership.",
};

function ResourceSection({
  id,
  title,
  children,
  links,
}: {
  id: string;
  title: string;
  children: ReactNode;
  links?: { href: string; label: string }[];
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
      <div className="mt-3 font-body text-sm text-kelly-text/85">{children}</div>
      {links?.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 font-body text-sm text-kelly-deep">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="font-semibold text-kelly-blue hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default function CountyPartyLaunchKitPage() {
  const libraryItems = VOLUNTEER_RESOURCES.filter((r) => r.category === "county-party-organizing");

  return (
    <>
      <PageHero
        eyebrow="Volunteers"
        title="County Party Launch Kit"
        subtitle="Operating rhythm for county leadership: one strong monthly meeting, growing Power of 5 networks, precinct triads, and steady comms — same lane tools as campaign teams."
      >
        <Button href="/start-a-local-team" variant="outline">
          Start a local team
        </Button>
        <Button href="/volunteer/resources" variant="outline">
          Full library
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-6">
          <p className="font-body text-sm text-kelly-text/85">
            Use this kit with your county dashboard tabs (Monthly meeting, P5 / VR, Precinct teams, Rollup). Creating a monthly
            meeting in the dashboard publishes a campaign calendar event and queues outreach tasks for your team.
          </p>

          <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page/60 p-5">
            <h3 className="font-heading text-base font-bold text-kelly-navy">Quick links</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm text-kelly-deep">
              <li>
                <Link href="#meeting-checklist" className="text-kelly-blue hover:underline">
                  Monthly meeting checklist
                </Link>
              </li>
              <li>
                <Link href="#agenda-templates" className="text-kelly-blue hover:underline">
                  Agenda templates
                </Link>
              </li>
              <li>
                <Link href="#p5-invites" className="text-kelly-blue hover:underline">
                  P5 invitation patterns
                </Link>
              </li>
              <li>
                <Link href="#new-attendee-follow-up" className="text-kelly-blue hover:underline">
                  New attendee follow-up
                </Link>
              </li>
              <li>
                <Link href="#precinct-guide" className="text-kelly-blue hover:underline">
                  Precinct team guide
                </Link>
              </li>
              <li>
                <Link href="#vr-toolkit" className="text-kelly-blue hover:underline">
                  Voter registration toolkit
                </Link>
              </li>
              <li>
                <Link href="#social-graphics" className="text-kelly-blue hover:underline">
                  Social media graphics
                </Link>
              </li>
              <li>
                <Link href="#talking-points" className="text-kelly-blue hover:underline">
                  Talking points
                </Link>
              </li>
            </ul>
          </div>

          <ResourceSection
            id="meeting-checklist"
            title="Monthly meeting checklist"
            links={[
              { href: "/field-playbook/roles/events-hosting-playbook", label: "Events hosting playbook (day-of patterns)" },
            ]}
          >
            <p>Four weeks out: lock venue, draft agenda, set RSVP goal and new-attendee goal, assign leads per lane.</p>
            <p className="mt-2">
              Two weeks out: leadership sends P5 invites; Social posts save-the-date; Precinct leads confirm captains can attend.
            </p>
            <p className="mt-2">
              Week of: reminders, volunteer role sheet, featured speaker brief, registration table supplies if doing VR on-site.
            </p>
            <p className="mt-2">After: thank-yous, capture new volunteers, schedule one-on-one follow-ups, log KPIs on the rollup tab.</p>
          </ResourceSection>

          <ResourceSection
            id="agenda-templates"
            title="Meeting agenda templates"
            links={[
              { href: "/volunteer/resources/email-templates#county-meeting-invite", label: "Email: invite to monthly meeting" },
            ]}
          >
            <p>
              Open · welcome and land acknowledgement if your county uses one · quick wins since last month · officer or committee
              reports (brief) · featured topic or guest · city/precinct breakout or “open floor” for new leaders · volunteer asks
              (specific shifts) · close with next meeting date and RSVP link.
            </p>
          </ResourceSection>

          <ResourceSection
            id="p5-invites"
            title="P5 invitation templates"
            links={[
              { href: "/volunteer/resources/email-templates#county-p5-invite-meeting", label: "Email: invite P5 to county meeting" },
              { href: "/volunteer/resources/email-templates#invite-p5", label: "General P5 circle invite (peer copy)" },
            ]}
          >
            <p>
              Every leadership member: invite your Power of 5 personally. The dashboard Action Queue models “Needed now / Coming up /
              Next after that” around each meeting cycle.
            </p>
          </ResourceSection>

          <ResourceSection
            id="new-attendee-follow-up"
            title="New attendee follow-up templates"
            links={[
              { href: "/volunteer/resources/email-templates#county-follow-up-meeting", label: "Email: follow-up after meeting" },
              { href: "/volunteer/resources/email-templates#county-rsvp-reminder", label: "Email: RSVP reminder" },
              { href: "/volunteer/resources/email-templates#county-thank-attend", label: "Email: thank-you for attending" },
            ]}
          >
            <p>Within 48 hours: thank first-timers, offer a concrete next step (subcommittee, table shift, P5 coffee), and one clear ask.</p>
          </ResourceSection>

          <ResourceSection
            id="precinct-guide"
            title="Precinct team guide"
            links={[
              { href: "/volunteer/resources/email-templates#county-precinct-invite", label: "Email: invite to precinct team" },
              { href: "/field-playbook/overview/self-building-team-system", label: "Self-building team system (3-person triad)" },
            ]}
          >
            <p>
              Identify open precincts on the Precinct Teams tab: who is captain, who is recruiting, who covers turnout story for that
              box. Place ready volunteers into empty triads using the same downstream patterns as geographic teams.
            </p>
          </ResourceSection>

          <ResourceSection
            id="vr-toolkit"
            title="Voter registration toolkit"
            links={[
              { href: "/volunteer/resources/email-templates#vr-event", label: "Email: VR help session invite" },
              { href: "/field-playbook/metrics/key-metrics", label: "Metrics & GOTV readiness mirror" },
            ]}
          >
            <p>
              Pair tabling with P5 follow-through: every registration conversation should land in someone’s relationship map, with a
              reminder before deadlines your state party or SOS publishes.
            </p>
          </ResourceSection>

          <ResourceSection
            id="social-graphics"
            title="Social media graphics"
            links={[{ href: "/volunteer/resources/social-media-design", label: "Social & Canva hub" }]}
          >
            <p>Use local venue photos, date/time in large type, and a single CTA (RSVP or county party contact). Avoid crowded text on stories.</p>
          </ResourceSection>

          <ResourceSection
            id="talking-points"
            title="Talking points"
            links={[{ href: "/volunteer/resources/messaging", label: "Messaging library" }]}
          >
            <p>Keep county meetings welcoming and factual. Escalate policy or legal questions to state party or campaign counsel as your rules require.</p>
          </ResourceSection>

          <div className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Resource index</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/80">Curated links registered in the volunteer resource library.</p>
            <ul className="mt-4 space-y-3">
              {libraryItems.map((r) => (
                <li key={r.id} className="rounded-xl border border-kelly-text/10 bg-kelly-page/50 px-4 py-3">
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
                </li>
              ))}
            </ul>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
