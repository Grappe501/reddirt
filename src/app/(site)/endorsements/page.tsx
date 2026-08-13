import type { Metadata } from "next";
import Image from "next/image";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { listConfirmedEndorsements } from "@/content/website/confirmed-endorsements";
import { getCampaignPhotoById } from "@/content/media/campaign-photo-registry";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Endorsements",
  description:
    "Confirmed endorsements for Kelly Grappe’s campaign for Arkansas Secretary of State — organized by the breadth of support, with verified organizations and individuals only.",
  path: "/endorsements",
});

export default async function EndorsementsPage() {
  const endorsements = listConfirmedEndorsements();
  const joinHref = getJoinCampaignHref();

  return (
    <>
      <MediaPageHero
        slotKey="endorsements.hero"
        layout="split"
        eyebrow="Trust"
        title="Endorsements"
        subtitle="Only formal, campaign-confirmed endorsements appear here. A photograph or conversation is never listed as support."
      >
        <Button href="/about" variant="outlineOnDark">
          Read About Kelly’s Experience
        </Button>
        <Button href={joinHref} variant="primary">
          Stay connected
        </Button>
      </MediaPageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-4xl">
          <aside className="mx-auto max-w-2xl rounded-card border border-kelly-ink/10 bg-kelly-fog/50 px-6 py-5 text-left md:px-7">
            <h2 className="font-heading text-base font-bold tracking-tight text-kelly-ink">
              Published when confirmed — empty until then
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
              Attendance at an event, a photograph, or a private conversation is not an endorsement. Names appear when
              organizations and community leaders formally announce support.
            </p>
          </aside>

          {endorsements.length === 0 ? (
            <div className="mt-10 rounded-card border border-kelly-ink/15 bg-kelly-fog/40 px-6 py-10 text-center md:px-10">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink">
                Earned support, published when confirmed
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
                This page stays intentionally quiet until organizations and community leaders formally announce support.
                When they do, you will see the exact organization name, approved wording, and source here.
              </p>
            </div>
          ) : (
            <ul className="mt-10 space-y-8">
              {endorsements.map((item) => {
                const photo = item.relatedPhotoId ? getCampaignPhotoById(item.relatedPhotoId) : null;
                return (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-[var(--shadow-soft)]"
                  >
                    <div className={photo ? "grid gap-0 lg:grid-cols-5" : undefined}>
                      {photo ? (
                        <figure className="border-b border-kelly-ink/10 bg-kelly-fog lg:col-span-2 lg:border-b-0 lg:border-r">
                          <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:h-full lg:min-h-[280px]">
                            <Image
                              src={photo.src}
                              alt={photo.accessibility.altText}
                              width={photo.basic.width ?? 768}
                              height={photo.basic.height ?? 1024}
                              className="h-full w-full object-cover object-[50%_18%]"
                              sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                          </div>
                          <figcaption className="border-t border-kelly-ink/10 px-4 py-3 font-body text-xs leading-relaxed text-kelly-slate">
                            {photo.accessibility.caption}
                            {item.relatedPhotoNote ? (
                              <span className="mt-2 block text-kelly-muted">{item.relatedPhotoNote}</span>
                            ) : null}
                          </figcaption>
                        </figure>
                      ) : null}

                      <div className={`p-6 md:p-8 ${photo ? "lg:col-span-3" : ""}`}>
                        <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold">
                          {item.coalitionLabel}
                        </p>
                        <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-kelly-ink">
                          {item.name}
                        </h2>
                        <p className="mt-2 font-body text-sm font-semibold uppercase tracking-wide text-kelly-navy">
                          {item.status}
                          {item.announcedDateLabel ? ` · ${item.announcedDateLabel}` : null}
                        </p>
                        <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">{item.description}</p>
                        {item.sourceNote ? (
                          <p className="mt-4 font-body text-sm text-kelly-muted">{item.sourceNote}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
