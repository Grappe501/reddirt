import Link from "next/link";
import Image from "next/image";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import type { EditorialPiece } from "@/content/editorial/types";

export function HomeEditorialSpotlightSection({ pieces }: { pieces: EditorialPiece[] }) {
  if (pieces.length === 0) return null;

  return (
    <section className="bg-kelly-text py-section-y text-kelly-page lg:py-section-y-lg" aria-labelledby="editorial-spot-heading">
      <ContentContainer>
        <FadeInWhenVisible className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold/90">Editorial</p>
            <h2 id="editorial-spot-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Long-form conviction
            </h2>
            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-kelly-page/75">
              Essays and framing—how we think about trust, institutions, and Arkansas.
            </p>
          </div>
          <Link
            href="/editorial"
            className="inline-flex w-fit rounded-btn border border-kelly-page/25 px-4 py-2.5 font-body text-sm font-semibold text-kelly-page hover:border-kelly-gold/50"
          >
            All editorial →
          </Link>
        </FadeInWhenVisible>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {pieces.slice(0, 3).map((p, i) => (
            <FadeInWhenVisible key={p.slug} delay={0.07 * i}>
              <Link href={`/editorial/${p.slug}`} className="group block h-full">
                <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-kelly-page/10">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-gold/85">{p.category}</p>
                <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-kelly-page group-hover:text-kelly-gold md:text-xl">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-kelly-page/72">{p.summary}</p>
              </Link>
            </FadeInWhenVisible>
          ))}
        </div>
      </ContentContainer>
    </section>
  );
}
