"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { resolveRoleQueryFromOnboardingLane, VOLUNTEER_ROLE_QUERY } from "@/lib/campaign-links";
import type { VolunteerInput } from "@/lib/forms/schemas";
import { OnboardingChecklist } from "@/components/volunteer/OnboardingChecklist";
import { RoleCard } from "@/components/volunteer/RoleCard";
import { TeamBuilderSection } from "@/components/volunteer/TeamBuilderSection";
import { VolunteerSignupCta } from "@/components/volunteer/VolunteerSignupCta";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { isNativeVolunteerFormEnabled } from "@/config/volunteer-signup";
import { DISCORD_VOLUNTEER_BLURB } from "@/lib/volunteer-ops/discord-volunteer-copy";

type Lane = "events" | "social" | "relational" | "unsure" | null;

function laneFromSignupRoleParam(role: string | null | undefined): Lane {
  if (!role) return null;
  if (role === VOLUNTEER_ROLE_QUERY.events) return "events";
  if (role === VOLUNTEER_ROLE_QUERY.socialMedia) return "social";
  if (role === VOLUNTEER_ROLE_QUERY.powerOf5) return "relational";
  if (role === VOLUNTEER_ROLE_QUERY.notSure) return "unsure";
  return null;
}

function preferredRoleForLane(lane: Lane): VolunteerInput["preferredRole"] | null {
  if (!lane || lane === "unsure") return "not_sure";
  if (lane === "events") return "events";
  if (lane === "social") return "social_media";
  return "power_of_five";
}

const LANE_MESSAGES: Record<Exclude<Lane, null>, string> = {
  events: "Great — choose Events on the volunteer signup form when you get there.",
  social: "Great — choose Social media on the volunteer signup form when you get there.",
  relational: "Great — choose Power of 5 / voter registration on the volunteer signup form when you get there.",
  unsure: "Great — mark “not sure yet” on the signup form and we’ll help you find the right fit.",
};

export function VolunteerOnboardingPage({
  campaignClock,
  initialSignupRole = null,
}: {
  campaignClock?: ReactNode;
  /** `?role=` from `/volunteer` when using native signup deep links */
  initialSignupRole?: string | null;
}) {
  const nativeVolunteerForm = isNativeVolunteerFormEnabled();
  const searchParams = useSearchParams();
  const [lane, setLane] = useState<Lane>(() => laneFromSignupRoleParam(initialSignupRole ?? undefined));

  useEffect(() => {
    const fromUrl = laneFromSignupRoleParam(searchParams.get("role"));
    if (fromUrl) setLane(fromUrl);
  }, [searchParams]);

  const scrollToSignup = useCallback(() => {
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const pickLane = useCallback(
    (choice: Exclude<Lane, null>) => {
      setLane(choice);
      scrollToSignup();
    },
    [scrollToSignup],
  );

  return (
    <>
      {campaignClock ? (
        <div className="border-b border-kelly-text/10 bg-kelly-fog/20">
          <ContentContainer className="max-w-5xl py-5">{campaignClock}</ContentContainer>
        </div>
      ) : null}

      <FullBleedSection padY aria-labelledby="how-this-works-heading" id="how-this-works" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="how-this-works-heading"
            align="left"
            eyebrow="Section 1"
            title="How this works"
            subtitle="Small teams, clear lanes, steady progress."
          />
          <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-text/85">
            <p>We organize in small <strong>3-person teams</strong>. Each team has three coordinators:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Events</strong> — gatherings, tabling, and volunteer meetups.
              </li>
              <li>
                <strong>Social media</strong> — sharing campaign-approved content and lifting up local activity.
              </li>
              <li>
                <strong>Power of 5 / voter registration</strong> — relational organizing: people you know, respectful
                follow-up, and connecting folks to registration when it fits.
              </li>
            </ul>
            <p>
              Each person <strong>owns one lane</strong>. The goal isn’t to overwhelm volunteers — it’s to make{" "}
              <strong>small weekly actions</strong> stack up across many people and many communities.
            </p>
            <p className="rounded-lg border border-kelly-gold/30 bg-kelly-gold/[0.08] p-3 text-kelly-deep/95">{DISCORD_VOLUNTEER_BLURB}</p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="build-three-person-team-heading" id="build-three-person-team" className="scroll-mt-24">
        <TeamBuilderSection />
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="three-roles-heading" id="three-roles" className="scroll-mt-24">
        <ContentContainer className="max-w-5xl">
          <SectionHeading
            id="three-roles-heading"
            align="left"
            eyebrow="Section 3"
            title="The three roles"
            subtitle="Pick the lane that fits your gifts — you can adjust later with your team."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <RoleCard
              title="Events Coordinator"
              description="Helps identify, plan, and support small local gatherings, tabling opportunities, house meetings, community events, and volunteer meetups."
              weeklyTasks={[
                "Find or suggest one local event opportunity.",
                "Help invite people to one gathering.",
                "Report event needs back to the team.",
              ]}
            />
            <RoleCard
              title="Social Media Coordinator"
              description="Helps amplify campaign-approved content and local volunteer activity online."
              weeklyTasks={[
                "Share approved campaign content.",
                "Invite friends to follow campaign channels.",
                "Capture photos or updates from local activity when appropriate.",
              ]}
            />
            <RoleCard
              title="Power of 5 / VR Coordinator"
              description="Helps volunteers identify five people they personally know and move them toward support, signup, voter registration, or action."
              weeklyTasks={[
                "Ask each volunteer to choose five people.",
                "Encourage one relational organizing touch per week.",
                "Help connect voter registration opportunities to local activity.",
              ]}
            />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="first-15-heading" id="first-15-minutes" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="first-15-heading"
            align="left"
            eyebrow="Section 4"
            title="Your first 15 minutes"
            subtitle="A simple sequence anyone can finish today."
          />
          <div className="mt-6 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
            <OnboardingChecklist />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="pick-lane-heading" id="pick-your-lane" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="pick-lane-heading"
            align="left"
            eyebrow="Section 5"
            title="Pick your lane"
            subtitle="No wrong answers — this just helps you orient before you sign up."
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("events")}>
              I can help with events
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("social")}>
              I can help with social media
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("relational")}>
              I can help with Power of 5 / voter registration
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("unsure")}>
              I’m not sure yet
            </Button>
          </div>
          {lane ? (
            <p
              className="mt-6 rounded-xl border border-kelly-gold/35 bg-kelly-gold/10 px-4 py-3 font-body text-sm font-medium text-kelly-deep"
              role="status"
            >
              {LANE_MESSAGES[lane]}
            </p>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="playbook-preview-heading" id="playbook" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="playbook-preview-heading"
            align="left"
            eyebrow="Section 6"
            title="Want the full field guide?"
            subtitle="The full playbook explains how county, city, precinct, and neighborhood teams work together."
          />
          <div className="mt-6 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6">
            <p className="font-body text-sm leading-relaxed text-kelly-text/85">
              When you are ready to go deeper, the field playbook walks through the same three roles at every level — so
              you always know what “good” looks like.
            </p>
            <div className="mt-5">
              <Button href="/field-playbook" variant="secondary">
                Open field playbook
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="signup-heading" id="signup" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="signup-heading"
            align="left"
            eyebrow="Section 7"
            title="Ready to join?"
            subtitle="Complete the volunteer signup form and someone from the campaign will be able to connect you to the right local team."
          />
          <div className="mt-8 flex flex-col items-start gap-4">
            {nativeVolunteerForm ? (
              <>
                <VolunteerForm presetPreferredRole={preferredRoleForLane(lane)} />
                <div className="flex flex-wrap items-center gap-2 font-body text-xs text-kelly-text/60">
                  <span>Prefer the legacy Squarespace form?</span>
                  <VolunteerSignupCta
                    variant="outline"
                    forceExternal
                    roleQuery={resolveRoleQueryFromOnboardingLane(lane)}
                  />
                </div>
              </>
            ) : (
              <VolunteerSignupCta roleQuery={resolveRoleQueryFromOnboardingLane(lane)} />
            )}
            <p className="font-body text-sm text-kelly-text/70">
              After you sign up, use the{" "}
              <Link href="/volunteer/resources" className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                volunteer resource library
              </Link>
              , bookmark this page, or open the{" "}
              <Link href="/field-playbook" className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                field playbook
              </Link>{" "}
              — your team can run the weekly rhythm there.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="after-signup-heading" id="after-signup" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="after-signup-heading"
            align="left"
            eyebrow="After signup"
            title="What happens after you sign up?"
            subtitle="A simple picture of what comes next — details may vary as we finish moving tools onto this site."
          />
          <ol className="mt-8 list-decimal space-y-4 pl-6 font-body text-base leading-relaxed text-kelly-text/85">
            <li className="pl-1">Your information is received by the campaign.</li>
            <li className="pl-1">
              Automated emails begin <strong>once campaign email automation is live</strong>.
            </li>
            <li className="pl-1">You receive onboarding materials and next steps.</li>
            <li className="pl-1">A coordinator may connect you with a local team.</li>
            <li className="pl-1">If no team exists yet, you may be invited to help start one.</li>
            <li className="pl-1">
              You can <strong>immediately</strong> use the{" "}
              <Link href="/field-playbook" className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                field playbook
              </Link>{" "}
              and{" "}
              <Link href="/volunteer/resources" className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                resource library
              </Link>{" "}
              to begin.
            </li>
          </ol>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-label="Share this page">
        <ContentContainer className="max-w-3xl">
          <div className="rounded-2xl border border-kelly-text/10 bg-white px-5 py-6 text-center print:border-kelly-text/30">
            <p className="font-body text-sm leading-relaxed text-kelly-text/85">
              Share this page with a QR code, text message, or social post. A new volunteer can start here without needing a
              long explanation.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
