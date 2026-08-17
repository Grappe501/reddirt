import type { Metadata } from "next";

import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { Button } from "@/components/ui/Button";
import { VolunteerOnboardingPage } from "@/components/volunteer/VolunteerOnboardingPage";
import { getRequestLocale } from "@/i18n/server";
import { volunteerPageCopy } from "@/i18n/pages/volunteer-page";
import { pageMeta } from "@/lib/seo/metadata";
import { withLocaleHref } from "@/i18n/path";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return pageMeta({
    title: volunteerPageCopy("metaTitle", locale),
    description: volunteerPageCopy("metaDescription", locale),
    path: locale === "es" ? "/es/volunteer" : "/volunteer",
  });
}

type PageProps = { searchParams: Promise<{ role?: string }> };

export default async function VolunteerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const locale = await getRequestLocale();
  return (
    <>
      <MediaPageHero
        slotKey="get-involved.hero"
        layout="split"
        eyebrow={volunteerPageCopy("eyebrow", locale)}
        title={volunteerPageCopy("title", locale)}
        subtitle={volunteerPageCopy("subtitle", locale)}
      >
        <Button href="#how-this-works" variant="primary">
          {volunteerPageCopy("startOnboarding", locale)}
        </Button>
        <Button href={withLocaleHref("/field-playbook", locale)} variant="outlineOnDark">
          {volunteerPageCopy("fieldPlaybook", locale)}
        </Button>
        <Button href={withLocaleHref("/volunteer/resources", locale)} variant="outlineOnDark">
          {volunteerPageCopy("resourceLibrary", locale)}
        </Button>
      </MediaPageHero>
      <VolunteerOnboardingPage campaignClock={<CampaignCountdown />} initialSignupRole={sp.role ?? null} />
    </>
  );
}
