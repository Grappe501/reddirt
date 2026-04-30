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
    "Relational organizing is the core growth engine: start with five people you know—story, show up, register, bring five more.",
};

export default function Bring5FriendsPage() {
  return (
    <>
      <PageHero
        eyebrow="Power of 5"
        title="Bring 5 Friends"
        subtitle="Relational organizing is the core growth engine for this campaign. Most people will not join because a flyer told them to—they join because someone they trust asks."
      >
        <Button href="#power-of-5-signup" variant="primary">
          Start your Power of 5
        </Button>
        <Button href="/get-involved" variant="outline">
          Get Involved
        </Button>
        <Button href={powerOf5OnboardingHref} variant="outline">
          Walkthrough (demo)
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="why-heading"
            align="left"
            eyebrow="Why"
            title="People trust people they know"
            subtitle="Ads and mailers fill the mailbox. Trust usually comes from a name in your phone—a friend, cousin, coworker, or neighbor who will answer a follow-up text."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="how-heading"
            align="left"
            eyebrow="How"
            title="Start with five"
            subtitle="Not five thousand—five actual people you will talk to this month."
          />
          <ul className="mt-6 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Friends</li>
            <li>Family</li>
            <li>Coworkers</li>
            <li>Neighbors</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-heading"
            align="left"
            eyebrow="What"
            title="Ask each person for one next step"
            subtitle="One clear ask beats a laundry list. Let them choose what fits—then check back like a neighbor."
          />
          <ul className="mt-6 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>
              Read{" "}
              <Link href="/biography" className="font-semibold text-kelly-navy underline">
                Kelly’s story
              </Link>
            </li>
            <li>
              Attend something—a{" "}
              <Link href="/events" className="font-semibold text-kelly-navy underline">
                campaign event
              </Link>
              , coffee, or small room you help host
            </li>
            <li>
              <Link href="/voter-registration" className="font-semibold text-kelly-navy underline">
                Vote or register / check registration
              </Link>
            </li>
            <li>Bring 5 more when they are ready—same simple frame, no pressure</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-to-start-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="how-to-start-heading"
            align="left"
            eyebrow="Practice"
            title="How to start"
            subtitle="Keep the first touch light—you are opening a door, not giving a speech."
          />
          <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Write down five names you will actually text or call—not a fantasy list.</li>
            <li>Pick a two-week window so follow-up doesn’t drift forever.</li>
            <li>Send a link or offer to sit together with{" "}
              <Link href="/biography" className="font-semibold text-kelly-navy underline">
                Kelly’s story
              </Link>{" "}
              or{" "}
              <Link href="/about/why-kelly" className="font-semibold text-kelly-navy underline">
                Why Kelly
              </Link>
              .</li>
            <li>Offer an event or date; if they decline, thank them and stay kind—relationships outlast one election.</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-to-say-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-to-say-heading"
            align="left"
            eyebrow="Words"
            title="What to say"
            subtitle="Use your own voice—honest beats slick every time."
          />
          <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>
              <span className="font-semibold text-kelly-text">The simple frame: </span>
              “I’m asking a few people I trust to take a look. No debate homework—just read or come with me once.”
            </li>
            <li>
              <span className="font-semibold text-kelly-text">Why it matters to you: </span>
              One sentence in plain English—school board, business background, elections office, whatever is true for you.
            </li>
            <li>
              <span className="font-semibold text-kelly-text">What you are not doing: </span>
              Arguing the whole internet, guessing fraud, or pressuring someone who said no.
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="what-to-ask-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-to-ask-heading"
            align="left"
            eyebrow="The ask"
            title="What to ask"
            subtitle="Pick one lane per conversation; you can always come back for another."
          />
          <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>“Will you read Kelly’s story this week and tell me what stood out?”</li>
            <li>“Can you come with me to [event / coffee]—I’ll buy?”</li>
            <li>“Will you check your registration with me—takes two minutes?”</li>
            <li>“If this resonates, would you bring five people you trust into the same kind of chat?”</li>
          </ul>
          <p className="mt-6 font-body text-sm text-kelly-text/70">
            Quick links:{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/from-the-road">
              From the Road
            </Link>
            {" · "}
            <Link className="font-semibold text-kelly-navy underline" href="/explainers">
              Explainers
            </Link>
            {" · "}
            <Link className="font-semibold text-kelly-navy underline" href="/events">
              Events
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="signup-placeholder-heading">
        <ContentContainer>
          <div
            id="power-of-5-signup"
            className="scroll-mt-28 rounded-card border border-kelly-navy/15 bg-kelly-page px-6 py-8 shadow-[var(--shadow-soft)] md:px-10 md:py-10"
          >
            <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">Power of 5</p>
            <h2 id="signup-placeholder-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
              Start your Power of 5
            </h2>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">Signup coming soon.</p>
            <p className="mt-3 max-w-2xl font-body text-sm text-kelly-text/60">TODO: connect to CRM / workflow intake.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/get-involved#volunteer" variant="outline" className="min-h-[48px]">
                Volunteer in the meantime
              </Button>
              <Button href={powerOf5OnboardingHref} variant="outline" className="min-h-[48px]">
                Walkthrough (demo)
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
