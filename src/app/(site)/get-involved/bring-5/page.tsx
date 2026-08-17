import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Power of 5",
  description:
    "The Power of 5 is this campaign’s independent relational organizing approach: start with five people you know.",
  path: "/get-involved/bring-5",
});

const ways = [
  "Talk with five people about why this race matters.",
  "Help five people check their registration or make a plan to vote.",
  "Invite five people to an event or civic conversation.",
  "Bring five people into the campaign as volunteers, donors, hosts or local connectors.",
  "Help someone else build their own Power of 5.",
] as const;

export default function Bring5FriendsPage() {
  return (
    <>
      <PageHero
        eyebrow="Power of 5"
        title="Your power is closer than you think"
        subtitle="You don’t need a political title, a huge following or years of campaign experience to make a difference. Start with five people."
      >
        <Button href="/volunteer/resources/power-of-5-workshop" variant="primary">
          Workshop materials
        </Button>
        <Button href="/get-involved#volunteer" variant="outline">
          Volunteer →
        </Button>
        <Button href="/events/request" variant="outline">
          Host Kelly →
        </Button>
        <Button href="/donate" variant="outline">
          Donate →
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">The Power of 5</h2>
          <div className="mt-6 space-y-4 font-body text-lg leading-relaxed text-kelly-slate">
            <p>
              The Power of 5 is our campaign’s approach to relational organizing: identify five people in your own
              circle, have real conversations with them, invite them to participate, and help them activate their own
              circles.
            </p>
            <p>
              The goal isn’t simply to collect volunteers. It’s to turn volunteers into leaders and build a campaign
              that grows through relationships — one conversation, one commitment and one neighbor at a time.
            </p>
            <p>Your five become their five. That’s how a campaign becomes a community.</p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">Ways to use your Power of 5</h2>
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
            <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">Get Involved</p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl">Activate your Power of 5</h2>
            <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85">
              Tell us you want to start. We’ll follow up with a simple next step.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/get-involved#volunteer" variant="primary" className="min-h-[48px]">
                Volunteer →
              </Button>
              <Button href="/events/request" variant="outline" className="min-h-[48px]">
                Host Kelly →
              </Button>
              <Button href="/donate" variant="outline" className="min-h-[48px]">
                Donate →
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
