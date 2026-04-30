import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { powerOf5OnboardingHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Bring 5 Friends · Power of 5",
  description:
    "Relational organizing for Kelly’s campaign: if her story gave you confidence, bring five people with you—neighbor to neighbor, no noise.",
};

const shareLinks: { label: string; href: string }[] = [
  { label: "Kelly’s story", href: "/biography" },
  { label: "Why Kelly", href: "/about/why-kelly" },
  { label: "Office explainers", href: "/explainers" },
  { label: "From the Road", href: "/from-the-road" },
];

const actionCards: { title: string; body: string; href: string }[] = [
  {
    title: "Send the story",
    body: "Share Kelly’s biography or a chapter that fits your conversation—let them read in their own time.",
    href: "/biography",
  },
  {
    title: "Invite to an event",
    body: "Put something on the calendar: county visit, listening session, or a room where Kelly’s team can answer questions.",
    href: "/events",
  },
  {
    title: "Ask them to vote",
    body: "Registration and deadlines shouldn’t be a guessing game—walk them to check or register.",
    href: "/voter-registration",
  },
  {
    title: "Ask them to bring 5",
    body: "When someone says yes, ask them to name five people they’ll invite next. That’s how the circle holds.",
    href: "#power-of-5-signup",
  },
  {
    title: "Report back / join the team",
    body: "Tell us what you’re hearing and get plugged into volunteer paths that match your county.",
    href: "/get-involved#volunteer",
  },
];

const crossLinks: { label: string; href: string }[] = [
  { label: "Kelly’s story", href: "/biography" },
  { label: "Why Kelly", href: "/about/why-kelly" },
  { label: "Events", href: "/events" },
  { label: "Voter registration", href: "/voter-registration" },
  { label: "Get Involved", href: "/get-involved" },
];

export default function Bring5FriendsPage() {
  return (
    <>
      <PageHero
        eyebrow="Power of 5"
        title="Bring 5 Friends"
        subtitle="If Kelly’s story gave you confidence, bring five people with you. This campaign grows when neighbors bring neighbors into the conversation—not when the loudest ad wins."
      >
        <Button href="#power-of-5-signup" variant="primary">
          Start your Power of 5
        </Button>
        <Button href="/get-involved" variant="outline">
          Get Involved hub
        </Button>
        <Button href={powerOf5OnboardingHref} variant="outline">
          Walkthrough (demo)
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-heading">
        <ContentContainer>
          <SectionHeading
            id="why-heading"
            align="left"
            eyebrow="Why"
            title="Trust travels through relationships"
            subtitle="Most people trust people they know more than ads, mailers, or political noise. This campaign grows when neighbors bring neighbors into the conversation."
          />
          <p className="mt-6 max-w-3xl font-body text-base leading-relaxed text-kelly-text/85">
            You do not need a perfect pitch—just honesty, patience, and the willingness to follow up. Relational organizing
            is the centerpiece of how this field program scales: small circles that repeat.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-heading">
        <ContentContainer>
          <SectionHeading
            id="how-heading"
            align="left"
            eyebrow="How"
            title="Start with five people"
            subtitle="Name five people you will actually talk to—not the whole county, not the whole internet."
          />
          <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Family</li>
            <li>Friends</li>
            <li>Coworkers</li>
            <li>Church or community members</li>
            <li>Neighbors</li>
            <li>People who rarely get asked</li>
          </ul>
          <p className="mt-6 font-heading text-sm font-bold uppercase tracking-wide text-kelly-navy/90">Share</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {shareLinks.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex rounded-full border border-kelly-navy/20 bg-white px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/40"
                >
                  {s.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/voter-registration"
                className="inline-flex rounded-full border border-kelly-navy/20 bg-white px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/40"
              >
                Invite them to vote/register
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="inline-flex rounded-full border border-kelly-navy/20 bg-white px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/40"
              >
                Invite them to an event
              </Link>
            </li>
          </ul>
          <p className="mt-4 max-w-3xl font-body text-sm text-kelly-text/70">
            Use the links for story and explainers; for registration and events, send people to{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/voter-registration">
              voter registration
            </Link>{" "}
            and the{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/events">
              campaign calendar
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-heading">
        <ContentContainer>
          <SectionHeading
            id="what-heading"
            align="left"
            eyebrow="What"
            title="One clear next step per person"
            subtitle="Ask each person to do one thing. Respect their time—one honest ask beats a laundry list."
          />
          <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Read Kelly’s story</li>
            <li>Register or check registration</li>
            <li>Attend an event</li>
            <li>Volunteer</li>
            <li>Donate if they can</li>
            <li>Bring five more</li>
          </ul>
          <p className="mt-4 max-w-3xl font-body text-sm text-kelly-text/65">
            Money is one lane among many—time, introductions, and showing up in your county matter just as much.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="action-cards-heading">
        <ContentContainer>
          <SectionHeading
            id="action-cards-heading"
            align="left"
            eyebrow="This week"
            title="Pick an action card"
            subtitle="Choose one move, run it with your five, then come back for the next card."
          />
          <ul className="mt-10 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
            {actionCards.map((card) => (
              <li key={card.title}>
                <Link
                  href={card.href}
                  className="flex h-full flex-col rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-kelly-navy/25"
                >
                  <span className="font-heading text-lg font-bold text-kelly-text">{card.title}</span>
                  <span className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-text/75">{card.body}</span>
                  <span className="mt-4 font-body text-sm font-semibold text-kelly-navy">Go →</span>
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="crosslinks-heading">
        <ContentContainer>
          <SectionHeading
            id="crosslinks-heading"
            align="left"
            eyebrow="Shareable links"
            title="Resources to send or open together"
            subtitle="Bookmark these for quick sends—same pages you’ll use in living rooms, break rooms, and church halls."
          />
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {crossLinks.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="font-body text-sm font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-text"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="signup-placeholder-heading">
        <ContentContainer>
          <div
            id="power-of-5-signup"
            className="scroll-mt-28 rounded-card border border-kelly-navy/15 bg-kelly-page px-6 py-8 shadow-[var(--shadow-soft)] md:px-10 md:py-10"
          >
            <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">Power of 5</p>
            <h2 id="signup-placeholder-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
              Start your Power of 5
            </h2>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
              Power of 5 signup coming soon.
            </p>
            <p className="mt-4 max-w-2xl font-body text-sm text-kelly-text/60">TODO: connect to CRM/workflow intake.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/get-involved#volunteer" variant="outline" className="min-h-[48px]">
                Volunteer while we wire signup
              </Button>
              <Button href={powerOf5OnboardingHref} variant="outline" className="min-h-[48px]">
                Open walkthrough (demo)
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
