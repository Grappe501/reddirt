import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { HostGatheringForm } from "@/components/forms/HostGatheringForm";
import { SupportList } from "@/components/organizing/SupportList";
import { representLocalEventVolunteerHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Host a gathering",
  description:
    "Host a porch, living room, coffee circle, postcard party, or phone bank about the Secretary of State’s office—with mentor support and a neighbor-led tone.",
};

export default function HostAGatheringPage() {
  return (
    <>
      <PageHero
        eyebrow="Open the circle"
        title="Host a gathering"
        subtitle="You don’t need a podium or a perfect speech. Most civic moments start when someone says: “Come sit—let’s talk like neighbors again.”"
      >
        <Button href="#host-form" variant="primary">
          Jump to host form
        </Button>
        <Button href="/events" variant="outline">
          See what’s scheduled
        </Button>
        <Button href={representLocalEventVolunteerHref} variant="outline">
          Represent at a public event
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-small-heading">
        <ContentContainer wide>
          <SectionHeading
            id="why-small-heading"
            align="left"
            eyebrow="Why small"
            title="Small gatherings move big public life"
            subtitle="People risk honesty in rooms where they know who’s listening. Scale starts as repetition—many small circles, not one perfect stage."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            {[
              {
                t: "Trust compounds",
                b: "The second gathering is easier than the first—because folks saw you keep your word.",
              },
              {
                t: "Politics gets specific",
                b: "Abstract fights shrink when someone names a rent hike, a bus route, or a classroom reality.",
              },
              {
                t: "Leaders emerge sideways",
                b: "The best organizers often start as “I’ll host snacks” people—not keynote types.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-kelly-text">{x.t}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/75">{x.b}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="types-heading">
        <ContentContainer>
          <SectionHeading
            id="types-heading"
            eyebrow="Formats"
            title="Gatherings people host with us"
            subtitle="If your idea fits in a living room, a porch, a kitchen table with postcards, or a phone-bank huddle—you’re probably in the right place."
          />
          <ResponsiveGrid cols="2" className="mt-12">
            {[
              { t: "Front porch conversation", b: "Low chairs, passing cars, honesty with sunscreen." },
              { t: "Living room circle", b: "Tea, name tags optional, a single brave question." },
              { t: "Coffee meetup", b: "Public enough to feel safe; small enough to finish sentences." },
              { t: "Local listening session", b: "Facilitated rounds—neighbor voice first, organizer voice last." },
              { t: "Issue briefing", b: "Teach the process: what a referendum is, how a petition works, what comes next." },
              {
                t: "Postcard writing party",
                b: "Simple scripts, shared stamps, a pile of paper—turn quiet supporters into a visible, voter-facing wave.",
              },
              {
                t: "Phone bank party",
                b: "Headsets optional, coffee required—pair up so first-timers sit next to someone who’s made the call before.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-kelly-text">{x.t}</h3>
                <p className="mt-3 font-body text-base text-kelly-text/75">{x.b}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="involves-heading">
        <ContentContainer>
          <SectionHeading
            id="involves-heading"
            align="left"
            eyebrow="Plain talk"
            title="What hosting actually involves"
            subtitle="We’re not asking for a production—just hospitality with boundaries."
          />
          <SupportList
            className="mt-8 max-w-3xl"
            items={[
              "Pick a date, a place, and a rough guest list (6–25 is a sweet spot).",
              "Send invites that name the purpose: listening, learning, or planning—not debating cable news.",
              "Set simple ground rules: respect, confidentiality, and room for disagreement.",
              "Take light notes—or ask a friend to—so themes can travel without gossiping individuals.",
              "End with one optional next step: another date, a signup, or a shared meal.",
            ]}
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="support-heading">
        <ContentContainer>
          <SectionHeading
            id="support-heading"
            align="left"
            eyebrow="Backup"
            title="What support the movement can provide"
            subtitle="You bring the room; we help with scaffolding, training hooks, and follow-through."
          />
          <SupportList
            className="mt-8 max-w-3xl"
            items={[
              "A short prep call with an experienced host or field mentor.",
              "Agenda shells you can adapt—not scripts to read robotically.",
              "Connections to translators, childcare brainstorms, and accessibility questions.",
              "Follow-up pathways: teams, trainings, or story capture when neighbors want it.",
            ]}
          />
          <p className="mt-8 max-w-3xl font-body text-sm text-kelly-text/60">
            When you host with us, a field mentor can help with pairings and follow-up—without turning this page into a
            long checklist.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="host-form" padY aria-labelledby="host-form-heading">
        <ContentContainer>
          <SectionHeading
            id="host-form-heading"
            align="left"
            eyebrow="Raise your hand"
            title="Tell us what you’re dreaming up"
            subtitle="This routes through the same secure intake as the rest of the site—no parallel inbox, no duplicate tracking."
          />
          <div className="mt-10 max-w-3xl">
            <HostGatheringForm id="host-gathering-form" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="expect-heading">
        <ContentContainer>
          <SectionHeading
            id="expect-heading"
            align="left"
            eyebrow="After you submit"
            title="What happens next"
            subtitle="Fast isn’t always possible—kind is."
          />
          <div className="mt-8 max-w-3xl space-y-4 font-body text-lg leading-relaxed text-kelly-text/85">
            <p>
              You’ll get a confirmation that we received your note. A human organizer will follow up with a short
              checklist—usually within a few days, faster when we have capacity.
            </p>
            <p>
              If you’re not ready to host yet, that’s fine. You can still{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/events">
                join an event
              </Link>
              ,{" "}
              <Link className="font-semibold text-kelly-navy underline" href={representLocalEventVolunteerHref}>
                volunteer to represent the campaign at a fair or civic night
              </Link>
              , or{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/start-a-local-team">
                start a team
              </Link>{" "}
              with friends.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Neighbors waiting"
        title="The table only works if someone sets it"
        description="If you’ve read this far, you’re already closer than you think."
        variant="primary-band"
      >
        <Button href="#host-form" variant="primary">
          Open the host form
        </Button>
        <Button href="/local-organizing" variant="outline">
          Explore local hubs
        </Button>
        <Button href={representLocalEventVolunteerHref} variant="outline">
          Represent locally
        </Button>
      </CTASection>
    </>
  );
}
