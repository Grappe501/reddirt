import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";
import { cn, focusRing } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Privacy & trust for organizers",
  description:
    "How this campaign handles relational organizing, public dashboards, forms, and voter help links—plain language on what is public, what stays private, and how to use tools responsibly.",
  path: "/privacy-and-trust",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyAndTrustPage() {
  return (
    <>
      <PageHero
        eyebrow="Organizing · trust"
        title="How we protect people"
        subtitle="Plain-language expectations for Power of 5, public dashboards, and campaign tools. This page explains our organizing approach—not a substitute for counsel-reviewed legal policies."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl space-y-10 font-body text-base leading-relaxed text-kelly-text/85">
          <p className="rounded-lg border border-kelly-text/10 bg-kelly-page/60 p-4 text-sm text-kelly-text/80">
            For site-wide collection and use of information you submit through forms, see our{" "}
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/privacy">
              Privacy
            </Link>{" "}
            page (draft for counsel).{" "}
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/terms">
              Terms of use
            </Link>{" "}
            and{" "}
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/disclaimer">
              Disclaimer
            </Link>{" "}
            apply to the site as posted.
          </p>

          <Section id="our-promise" title="Our promise">
            <p>
              We build organizing tools to grow participation and strengthen communities—not to embarrass people, expose private details, or turn neighbors into a public spectacle.
            </p>
            <p>
              That means we treat relationships and voter reference data as <strong>serious responsibilities</strong>: clear roles, careful boundaries, and room to opt out when someone says no.
            </p>
          </Section>

          <Section id="power-of-five" title="How Power of 5 uses relationships responsibly">
            <p>
              <strong>Power of 5</strong> is about small, trusted circles: you invite people you know, follow up with care, and see your own progress and team momentum—not a public dossier on anyone.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Relationship lists and follow-up queues are meant for <strong>people doing the work</strong>, scoped by role—not open directories for curiosity.</li>
              <li>Geography on public pages is shown as <strong>labels and aggregates</strong> (county, region, “coverage” stories)—not other people’s addresses on a map you can browse.</li>
              <li>Gamification, when we use it, should reward <strong>healthy habits</strong> (checking in, completing invites), not public shaming or ranking people by how they vote.</li>
            </ul>
          </Section>

          <Section id="voter-file-tools" title="What voter-file reference tools are—and are not">
            <p>
              A <strong>voter file</strong> (where the campaign is permitted to use one) is a reference for organizers: matching people to the right precinct, keeping lists accurate, and planning outreach at a <strong>neighborhood or district level</strong>.
            </p>
            <p>
              <strong>Reference tools can</strong> help staff and authorized organizers confirm geography, improve data quality, and support compliance-aware outreach—under campaign rules and training.
            </p>
            <p>
              <strong>They are not</strong> a public search engine for Arkansans, a hobby map of households, or a place to casually scroll through names. Browsing and microtargeting for spectacle are out of scope for how we want this program to behave.
            </p>
          </Section>

          <Section id="public-vs-private" title="What is public vs private">
            <p>Expectations by surface (details evolve as features ship; the boundaries stay the same):</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Public pages</strong> (for example statewide or county organizing views meant for everyone) emphasize <strong>rolled-up numbers</strong>, geography names, and education—not individual voter identities or sensitive scores.
              </li>
              <li>
                <strong>Signed-in or volunteer views</strong> can show more that is relevant to <strong>your</strong> work—your tasks, your team, your turf—without turning the whole file into something anyone on the open web can mine.
              </li>
              <li>
                <strong>Staff and admin tools</strong> exist for reconciliation, quality control, and auditing. Those screens carry extra duty of care: access should match the job, and sensitive exports should stay rare, controlled, and documented.
              </li>
            </ul>
          </Section>

          <Section id="no-household-maps" title="No public household maps">
            <p>
              We do not publish maps that let the public click around to <strong>households or individuals</strong> from voter data. If you see geography on the site, read it as <strong>storytelling and accountability at a community level</strong>, not a pin for every door.
            </p>
          </Section>

          <Section id="no-public-voter-browsing" title="No public voter-file browsing">
            <p>
              There is no feature goal of letting random visitors search a voter database from the campaign website. Organizing intelligence and county pages are built to explain <strong>how the field picture fits together</strong>, not to expose rows from a file.
            </p>
          </Section>

          <Section id="consent-and-safety" title="Consent and safety">
            <p>
              Real outreach should respect <strong>consent, opt-out, and local norms</strong>: if someone asks not to be contacted, that request should travel with how we use data. Leaders and organizers should coach teams to listen, back off, and escalate edge cases instead of arguing at the door.
            </p>
            <p>
              If you believe someone is being pressured or harassed through campaign-adjacent activity, use the contact paths below. We cannot solve every interpersonal situation, but we can take reports seriously and adjust training or access where appropriate.
            </p>
          </Section>

          <Section id="questions" title="How to ask questions">
            <p>
              For <strong>site privacy, forms, and legal notices</strong>, start with{" "}
              <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/privacy">
                Privacy
              </Link>{" "}
              and reach out through{" "}
              <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/get-involved">
                Get involved
              </Link>{" "}
              if you need a human.
            </p>
            <p>
              For <strong>organizing practices, training, or concerns about how data is used in the field</strong>, contact your county or regional lead if you have one, or use the same campaign contact path on{" "}
              <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/get-involved">
                Get involved
              </Link>
              . We will route you to the right staff member.
            </p>
          </Section>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
