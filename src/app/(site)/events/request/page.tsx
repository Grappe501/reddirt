import type { Metadata } from "next";
import { EventPathwayPage } from "@/components/events/EventPathwayPage";
import { inviteKellyContent } from "@/content/events/invite-kelly";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

const { meta, layerOne: L1 } = inviteKellyContent;

export const metadata: Metadata = pageMeta({
  title: meta.layerOne.title,
  description: meta.layerOne.description,
  path: meta.layerOne.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function InviteKellyLayerOnePage() {
  return (
    <EventPathwayPage
      layer={1}
      eyebrow={L1.eyebrow}
      title={L1.title}
      subtitle={L1.subtitle}
      nextStep={L1.nextCta}
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
