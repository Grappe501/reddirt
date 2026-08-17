import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/i18n/server";
import { esHubCopy } from "@/i18n/pages/es-hub";
import { withLocaleHref } from "@/i18n/path";
import { chromeText } from "@/i18n/chrome";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return pageMeta({
    title: esHubCopy("metaTitle", locale),
    description: esHubCopy("metaDescription", locale),
    path: "/es",
  });
}

export default async function SpanishVoterHubPage() {
  const locale = await getRequestLocale();

  const cards = [
    {
      title: esHubCopy("registerTitle", locale),
      body: esHubCopy("registerBody", locale),
      href: withLocaleHref("/voter-registration", locale),
      cta: chromeText("voteRegister", locale),
    },
    {
      title: esHubCopy("involvedTitle", locale),
      body: esHubCopy("involvedBody", locale),
      href: withLocaleHref("/get-involved", locale),
      cta: chromeText("navInvolved", locale),
    },
    {
      title: esHubCopy("volunteerTitle", locale),
      body: esHubCopy("volunteerBody", locale),
      href: withLocaleHref("/volunteer", locale),
      cta: chromeText("volunteer", locale),
    },
    {
      title: esHubCopy("inviteTitle", locale),
      body: esHubCopy("inviteBody", locale),
      href: withLocaleHref("/schedule", locale),
      cta: chromeText("itemInvite", locale),
    },
  ] as const;

  return (
    <div lang={locale}>
      <PageHero
        eyebrow={esHubCopy("eyebrow", locale)}
        title={esHubCopy("title", locale)}
        subtitle={esHubCopy("subtitle", locale)}
      >
        <Button href={withLocaleHref("/voter-registration", locale)} variant="primary">
          {chromeText("voteRegister", locale)}
        </Button>
        <Button href={withLocaleHref("/get-involved#join", locale)} variant="outline">
          {chromeText("itemStay", locale)}
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2">
            {cards.map((card) => (
              <li
                key={card.href}
                className="rounded-card border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)]"
              >
                <h2 className="font-heading text-xl font-bold text-kelly-ink">{card.title}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{card.body}</p>
                <p className="mt-5">
                  <Link
                    href={card.href}
                    className="inline-flex min-h-[44px] items-center rounded-btn bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white transition hover:bg-kelly-blue"
                  >
                    {card.cta} →
                  </Link>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl font-body text-sm text-kelly-muted">{esHubCopy("englishNote", locale)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={withLocaleHref("/events/request", locale)} variant="outline">
              {chromeText("itemInvite", locale)}
            </Button>
            <Button href="/" variant="outline">
              {chromeText("english", locale)}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </div>
  );
}
