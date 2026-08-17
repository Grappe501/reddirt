import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { ScheduleCampaignEventForm } from "@/components/forms/ScheduleCampaignEventForm";
import { getRequestLocale } from "@/i18n/server";
import { scheduleCopy } from "@/i18n/pages/schedule";
import { pageMeta } from "@/lib/seo/metadata";
import { withLocaleHref } from "@/i18n/path";
import { chromeText } from "@/i18n/chrome";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return pageMeta({
    title: scheduleCopy("metaTitle", locale),
    description: scheduleCopy("metaDescription", locale),
    path: locale === "es" ? "/es/schedule" : "/schedule",
  });
}

export default async function ScheduleCampaignEventPage() {
  const locale = await getRequestLocale();

  return (
    <>
      <MediaPageHero
        slotKey="schedule.hero"
        layout="split"
        eyebrow={scheduleCopy("eyebrow", locale)}
        title={scheduleCopy("title", locale)}
        subtitle={scheduleCopy("subtitle", locale)}
      >
        <Button href="#schedule-form" variant="primary">
          {scheduleCopy("shareOpportunity", locale)}
        </Button>
        <Button href={withLocaleHref("/events/request", locale)} variant="outlineOnDark">
          {scheduleCopy("invitePathway", locale)}
        </Button>
      </MediaPageHero>

      <FullBleedSection padY aria-labelledby="schedule-copy-heading">
        <ContentContainer wide className="max-w-3xl">
          <h2 id="schedule-copy-heading" className="font-heading text-xl font-bold text-kelly-text">
            {scheduleCopy("whatToInclude", locale)}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>{scheduleCopy("bullet1", locale)}</li>
            <li>{scheduleCopy("bullet2", locale)}</li>
            <li>{scheduleCopy("bullet3", locale)}</li>
          </ul>
          <p className="mt-6 font-body text-sm text-kelly-muted">
            {scheduleCopy("preferPathway", locale)}{" "}
            <Link href={withLocaleHref("/events/request", locale)} className="font-semibold text-kelly-navy underline">
              {chromeText("itemInvite", locale)}
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="schedule-form-heading">
        <ContentContainer wide>
          <h2 id="schedule-form-heading" className="sr-only">
            {locale === "es" ? "Formulario de solicitud de agenda" : "Public scheduling request form"}
          </h2>
          <ScheduleCampaignEventForm id="schedule-form" />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
