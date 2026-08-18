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
import { useLocale, useLocaleHref } from "@/i18n/client";
import {
  volunteerOnboardingCopy,
  volunteerRoleWeeklyTasks,
} from "@/i18n/pages/volunteer-onboarding";

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

function laneMessageKey(lane: Exclude<Lane, null>): "laneEventsMsg" | "laneSocialMsg" | "laneRelationalMsg" | "laneUnsureMsg" {
  if (lane === "events") return "laneEventsMsg";
  if (lane === "social") return "laneSocialMsg";
  if (lane === "relational") return "laneRelationalMsg";
  return "laneUnsureMsg";
}

export function VolunteerOnboardingPage({
  campaignClock,
  initialSignupRole = null,
}: {
  campaignClock?: ReactNode;
  /** `?role=` from `/volunteer` when using native signup deep links */
  initialSignupRole?: string | null;
}) {
  const locale = useLocale();
  const localeHref = useLocaleHref();
  const t = (key: Parameters<typeof volunteerOnboardingCopy>[0]) => volunteerOnboardingCopy(key, locale);
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

  const weeklyTasksLabel = t("weeklyTasksLabel");

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
            eyebrow={t("section1Eyebrow")}
            title={t("section1Title")}
            subtitle={t("section1Subtitle")}
          />
          <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-text/85">
            <p>{t("section1Intro")}</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>{t("section1EventsLane")}</li>
              <li>{t("section1SocialLane")}</li>
              <li>{t("section1RelationalLane")}</li>
            </ul>
            <p>{t("section1OwnLane")}</p>
            <p className="rounded-lg border border-kelly-gold/30 bg-kelly-gold/[0.08] p-3 text-kelly-deep/95">
              {t("discordBlurb")}
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="build-three-person-team-heading" id="build-three-person-team" className="scroll-mt-24">
        <TeamBuilderSection locale={locale} />
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="three-roles-heading" id="three-roles" className="scroll-mt-24">
        <ContentContainer className="max-w-5xl">
          <SectionHeading
            id="three-roles-heading"
            align="left"
            eyebrow={t("section3Eyebrow")}
            title={t("section3Title")}
            subtitle={t("section3Subtitle")}
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <RoleCard
              title={t("roleEventsTitle")}
              description={t("roleEventsDesc")}
              weeklyTasks={volunteerRoleWeeklyTasks("events", locale)}
              weeklyTasksLabel={weeklyTasksLabel}
            />
            <RoleCard
              title={t("roleSocialTitle")}
              description={t("roleSocialDesc")}
              weeklyTasks={volunteerRoleWeeklyTasks("social", locale)}
              weeklyTasksLabel={weeklyTasksLabel}
            />
            <RoleCard
              title={t("roleRelationalTitle")}
              description={t("roleRelationalDesc")}
              weeklyTasks={volunteerRoleWeeklyTasks("relational", locale)}
              weeklyTasksLabel={weeklyTasksLabel}
            />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="first-15-heading" id="first-15-minutes" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="first-15-heading"
            align="left"
            eyebrow={t("section4Eyebrow")}
            title={t("section4Title")}
            subtitle={t("section4Subtitle")}
          />
          <div className="mt-6 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
            <OnboardingChecklist locale={locale} />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="pick-lane-heading" id="pick-your-lane" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="pick-lane-heading"
            align="left"
            eyebrow={t("section5Eyebrow")}
            title={t("section5Title")}
            subtitle={t("section5Subtitle")}
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("events")}>
              {t("laneEventsBtn")}
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("social")}>
              {t("laneSocialBtn")}
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("relational")}>
              {t("laneRelationalBtn")}
            </Button>
            <Button type="button" variant="outline" className="min-h-[48px] flex-1" onClick={() => pickLane("unsure")}>
              {t("laneUnsureBtn")}
            </Button>
          </div>
          {lane ? (
            <p
              className="mt-6 rounded-xl border border-kelly-gold/35 bg-kelly-gold/10 px-4 py-3 font-body text-sm font-medium text-kelly-deep"
              role="status"
            >
              {t(laneMessageKey(lane))}
            </p>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="playbook-preview-heading" id="playbook" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="playbook-preview-heading"
            align="left"
            eyebrow={t("section6Eyebrow")}
            title={t("section6Title")}
            subtitle={t("section6Subtitle")}
          />
          <div className="mt-6 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6">
            <p className="font-body text-sm leading-relaxed text-kelly-text/85">{t("section6Body")}</p>
            <div className="mt-5">
              <Button href={localeHref("/field-playbook")} variant="secondary">
                {t("openFieldPlaybook")}
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
            eyebrow={t("section7Eyebrow")}
            title={t("section7Title")}
            subtitle={t("section7Subtitle")}
          />
          <div className="mt-8 flex flex-col items-start gap-4">
            {nativeVolunteerForm ? (
              <>
                <VolunteerForm presetPreferredRole={preferredRoleForLane(lane)} />
                <div className="flex flex-wrap items-center gap-2 font-body text-xs text-kelly-text/60">
                  <span>{t("preferLegacyForm")}</span>
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
              {t("afterSignupLead")}{" "}
              <Link
                href={localeHref("/volunteer/resources")}
                className="font-semibold text-kelly-navy underline hover:text-kelly-blue"
              >
                {t("resourceLibraryLink")}
              </Link>
              {t("afterSignupMid")}{" "}
              <Link href={localeHref("/field-playbook")} className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                {t("fieldPlaybookLink")}
              </Link>{" "}
              {t("afterSignupEnd")}
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="after-signup-heading" id="after-signup" className="scroll-mt-24">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="after-signup-heading"
            align="left"
            eyebrow={t("afterSignupEyebrow")}
            title={t("afterSignupTitle")}
            subtitle={t("afterSignupSubtitle")}
          />
          <ol className="mt-8 list-decimal space-y-4 pl-6 font-body text-base leading-relaxed text-kelly-text/85">
            <li className="pl-1">{t("afterSignup1")}</li>
            <li className="pl-1">{t("afterSignup2")}</li>
            <li className="pl-1">{t("afterSignup3")}</li>
            <li className="pl-1">{t("afterSignup4")}</li>
            <li className="pl-1">{t("afterSignup5")}</li>
            <li className="pl-1">
              {t("afterSignup6Lead")}{" "}
              <Link href={localeHref("/field-playbook")} className="font-semibold text-kelly-navy underline hover:text-kelly-blue">
                {t("fieldPlaybookLink")}
              </Link>{" "}
              {t("afterSignup6And")}{" "}
              <Link
                href={localeHref("/volunteer/resources")}
                className="font-semibold text-kelly-navy underline hover:text-kelly-blue"
              >
                {t("resourceLibraryShort")}
              </Link>{" "}
              {t("afterSignup6End")}
            </li>
          </ol>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-label={t("shareAriaLabel")}>
        <ContentContainer className="max-w-3xl">
          <div className="rounded-2xl border border-kelly-text/10 bg-white px-5 py-6 text-center print:border-kelly-text/30">
            <p className="font-body text-sm leading-relaxed text-kelly-text/85">{t("shareBlurb")}</p>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
