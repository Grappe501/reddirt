import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { getJoinCampaignHref, getVolunteerSignupHref } from "@/config/external-campaign";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Contact the Kelly Grappe for Arkansas Secretary of State campaign — email, volunteer, and invite requests.",
  path: "/contact",
});

/**
 * Thin public contact destination — accessibility of the campaign, not a new marketing section.
 */
export default async function ContactPage() {
  const joinHref = getJoinCampaignHref();
  const volunteerHref = getVolunteerSignupHref();

  return (
    <>
      <MediaPageHero
        slotKey="contact.hero"
        layout="split"
        eyebrow="Accessibility"
        title="Contact the campaign"
        subtitle="Clear routes to reach the campaign — no hidden forms, no pressure."
      >
        <Button href={joinHref} variant="primary">
          Email the campaign
        </Button>
        <Button href={volunteerHref} variant="outlineOnDark">
          Join the Campaign
        </Button>
        <Button href="/events/request" variant="outlineOnDark">
          Invite Kelly
        </Button>
      </MediaPageHero>
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl space-y-5 font-body text-base leading-relaxed text-kelly-slate">
          <p>
            For general questions, press, or accessibility barriers, email{" "}
            <a className="font-semibold text-kelly-navy underline" href="mailto:kelly@kellygrappe.com">
              kelly@kellygrappe.com
            </a>
            .
          </p>
          <p>
            To volunteer or host, use{" "}
            <a className="font-semibold text-kelly-navy underline" href="/get-involved">
              Get Involved
            </a>
            . Event invitations go through staff review before anything is confirmed.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
