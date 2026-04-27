import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PROOF_SECTION } from "@/content/home/homepagePremium";
import { PROOF_SECTION_PHOTO_IDS } from "@/content/home/proof-section-visuals";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { trailPhotoWittyCaption } from "@/content/media/campaign-trail-wit";

function ProofBlockVisual({ blockTitle }: { blockTitle: (typeof PROOF_SECTION.blocks)[number]["title"] }) {
  const id = PROOF_SECTION_PHOTO_IDS[blockTitle];
  const photo = id ? campaignTrailPhotos.find((p) => p.id === id) : undefined;
  if (!photo) {
    return (
      <div
        className="relative h-[160px] w-full shrink-0 bg-gradient-to-br from-kelly-blue/50 to-kelly-navy md:h-[180px]"
        aria-hidden
      />
    );
  }
  const caption = trailPhotoWittyCaption(photo);
  const unoptimized = photo.src.includes("/api/owned-campaign-media/");
  return (
    <div className="relative h-[160px] w-full shrink-0 overflow-hidden md:h-[180px]">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized={unoptimized}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-kelly-navy/95 via-kelly-navy/75 to-transparent px-3 pb-2.5 pt-10">
        <p className="line-clamp-2 text-left font-body text-[10px] leading-snug text-kelly-mist/95 md:text-[11px]">
          {caption}
        </p>
      </div>
    </div>
  );
}

export function HomeProofSection() {
  return (
    <section
      className="relative overflow-hidden bg-kelly-navy py-section-y text-kelly-mist lg:py-section-y-lg"
      aria-labelledby="proof-heading"
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-kelly-gold/[0.06] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-kelly-blue/40 blur-3xl" aria-hidden />
      <ContentContainer className="relative">
        <FadeInWhenVisible className="max-w-3xl">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{PROOF_SECTION.eyebrow}</p>
          <h2 id="proof-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-kelly-mist">
            {PROOF_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-mist/78 md:text-xl">{PROOF_SECTION.intro}</p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          {PROOF_SECTION.blocks.map((b, i) => (
            <FadeInWhenVisible key={b.title} delay={0.08 * i}>
              <div className="flex h-full flex-col overflow-hidden rounded-card border border-kelly-gold/15 bg-kelly-deep/80 shadow-xl shadow-black/20">
                <ProofBlockVisual blockTitle={b.title} />
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="font-heading text-xl font-bold text-kelly-mist">{b.title}</h3>
                  <p className="mt-3 flex-1 font-body text-base leading-relaxed text-kelly-mist/75">{b.body}</p>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 lg:mt-16">
          <Link
            href={PROOF_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold-soft"
          >
            {PROOF_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
