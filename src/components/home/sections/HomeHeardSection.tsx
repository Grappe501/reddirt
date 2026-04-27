import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { HeardDrillCards } from "@/components/home/HeardDrillCards";
import type { heardItems } from "@/content/homepage";

type Item = (typeof heardItems)[number];

export function HomeHeardSection({ items }: { items: readonly Item[] | Item[] }) {
  return (
    <div className="bg-white py-12 lg:py-14" aria-labelledby="heard-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">What we’re hearing</p>
          <h2 id="heard-heading" className="mt-4 font-heading text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold tracking-tight text-kelly-ink">
            Arkansas isn’t shy—people know what they need from this office
          </h2>
        </FadeInWhenVisible>
        <div className="mt-12">
          <HeardDrillCards items={items} />
        </div>
      </ContentContainer>
    </div>
  );
}
