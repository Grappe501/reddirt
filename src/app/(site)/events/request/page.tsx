import type { Metadata } from "next";
import { EventPathwayPage } from "@/components/events/EventPathwayPage";
import { inviteKellyContent } from "@/content/events/invite-kelly";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getRequestLocale } from "@/i18n/server";
import { inviteKellyLayer1Copy } from "@/i18n/pages/invite-kelly";
import { withLocaleHref } from "@/i18n/path";

const { meta, layerOne: L1 } = inviteKellyContent;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return pageMeta({
    title: locale === "es" ? inviteKellyLayer1Copy("title", locale) : meta.layerOne.title,
    description: meta.layerOne.description,
    path: locale === "es" ? "/es/events/request" : meta.layerOne.path,
    imageSrc: brandMediaFromLegacySite.statewideBanner,
  });
}

export default async function InviteKellyLayerOnePage() {
  const locale = await getRequestLocale();

  return (
    <EventPathwayPage
      layer={1}
      eyebrow={inviteKellyLayer1Copy("eyebrow", locale)}
      title={inviteKellyLayer1Copy("title", locale)}
      subtitle={inviteKellyLayer1Copy("subtitle", locale)}
      nextStep={{
        label: inviteKellyLayer1Copy("nextCta", locale),
        href: withLocaleHref("/events/request/how-it-works", locale),
      }}
    >
      <div className="space-y-10 font-body text-kelly-text/88">
        {L1.leadParagraphs.map((p) => (
          <p key={p.slice(0, 48)} className="text-base leading-relaxed md:text-[1.05rem]">
            {p}
          </p>
        ))}
        {L1.sections.map((section, si) => (
          <section key={section.heading} aria-labelledby={`invite-l1-section-${si}`}>
            <h2 id={`invite-l1-section-${si}`} className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
              {section.heading}
            </h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed md:text-[1.02rem]">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </EventPathwayPage>
  );
}
