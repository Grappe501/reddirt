import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import {
  CONVERSATION_STARTERS,
  REFLECTION_CATEGORIES,
  REFLECTION_PROMPTS,
  TRAINING_GUIDELINES,
} from "@/lib/power-of-5/onboarding-demo";

export const metadata: Metadata = pageMeta({
  title: "Power of 5 Workshop Materials",
  description:
    "Host or join a Power of 5 workshop: session flow, conversation practice, and a simple worksheet for five people you already know.",
  path: "/volunteer/resources/power-of-5-workshop",
});

const agenda = [
  { t: "Welcome", d: "Why we’re in the room. This is about people you already know—not a script and not a list to harvest." },
  { t: "What Power of 5 is", d: "Five trusted people. Real conversations. Invite them to participate, then help them start their own five." },
  { t: "Name your five", d: "Quiet writing time. Family, friends, neighbors, coworkers, church or community—people who already trust you." },
  { t: "Practice a conversation", d: "Pair up. Listen first. Ask what matters. Invite only after the conversation feels real." },
  { t: "Pick one next step", d: "Talk with five people. Help someone check registration. Invite someone to an event. Help someone else start their five." },
  { t: "Close", d: "Exchange a follow-up. The work continues after the room empties." },
] as const;

const ways = [
  "Talk with five people about why this race matters.",
  "Help five people check their registration or make a plan to vote.",
  "Invite five people to an event or civic conversation.",
  "Bring five people into the campaign as volunteers, donors, hosts, or local connectors.",
  "Help someone else build their own Power of 5.",
] as const;

export default function PowerOf5WorkshopMaterialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer resources"
        title="Power of 5 Workshop Materials"
        subtitle="Use this page to host a workshop or to walk yourself through the same session. About 60–90 minutes. No special title required."
      >
        <Button href="/get-involved/bring-5" variant="primary">
          What Power of 5 is
        </Button>
        <Button href="/get-involved#volunteer" variant="outline">
          Volunteer
        </Button>
        <Button href="/volunteer/resources" variant="outline">
          Resource library
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="Session"
            title="How to run the workshop"
            subtitle="One host. A table or a living room. Paper and pens if you have them. Phones down during the naming and practice blocks."
          />
          <ol className="mt-8 space-y-4">
            {agenda.map((step, i) => (
              <li
                key={step.t}
                className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">
                  {i + 1}. {step.t}
                </p>
                <p className="mt-2 font-body text-base leading-relaxed text-kelly-text/80">{step.d}</p>
              </li>
            ))}
          </ol>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="Worksheet"
            title="Name your five"
            subtitle="Write first names only if you are sharing paper in a group. These are people you already know."
          />
          <ul className="mt-6 columns-1 gap-x-8 sm:columns-2">
            {REFLECTION_CATEGORIES.map((item) => (
              <li key={item} className="break-inside-avoid py-1 font-body text-base text-kelly-text">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 font-heading text-lg font-bold text-kelly-ink">Ask yourself</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-slate">
            {REFLECTION_PROMPTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="Practice"
            title="How the conversation works"
          />
          <ul className="mt-6 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-slate">
            {TRAINING_GUIDELINES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-8 font-heading text-lg font-bold text-kelly-ink">Starters</p>
          <ul className="mt-3 space-y-3">
            {CONVERSATION_STARTERS.map((item) => (
              <li
                key={item}
                className="rounded-card border border-kelly-text/10 bg-kelly-wash/40 px-4 py-3 font-body text-base text-kelly-text"
              >
                “{item}”
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <SectionHeading align="left" eyebrow="Action" title="Ways to use your Power of 5" />
          <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-slate">
            {ways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-8 font-body text-sm text-kelly-slate">
            Help someone{" "}
            <Link href="/voter-registration" className="font-semibold text-kelly-navy underline">
              check their registration
            </Link>{" "}
            or join you at an{" "}
            <Link href="/events" className="font-semibold text-kelly-navy underline">
              event
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer>
          <div className="rounded-card border border-kelly-navy/15 bg-kelly-page px-6 py-8 shadow-[var(--shadow-soft)] md:px-10 md:py-10">
            <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">Next</p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
              After the workshop
            </h2>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
              Tell the campaign you started. We’ll follow up with a simple next step.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/get-involved#volunteer" variant="primary" className="min-h-[48px]">
                Volunteer
              </Button>
              <Button href="/get-involved/bring-5" variant="outline" className="min-h-[48px]">
                Power of 5
              </Button>
              <Button href="/volunteer/resources/messaging" variant="outline" className="min-h-[48px]">
                Talking points
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
