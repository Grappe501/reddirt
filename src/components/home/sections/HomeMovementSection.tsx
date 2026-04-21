import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";
import type { movementBeliefs } from "@/content/homepage";

type Belief = (typeof movementBeliefs)[number];

export function HomeMovementSection({ items }: { items: readonly Belief[] | Belief[] }) {
  return (
    <section className="bg-civic-midnight py-section-y text-civic-mist lg:py-section-y-lg" aria-labelledby="movement-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.26em] text-civic-gold-soft">Movement spine</p>
          <h2 id="movement-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-civic-mist">
            What this campaign is accountable to
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-civic-mist/75 md:text-lg">
            The same through-line you’ll see on the trail, in filings, and in how we treat clerks and voters.
          </p>
        </FadeInWhenVisible>
        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {items.map((b, i) => (
            <FadeInWhenVisible key={b.title} delay={0.05 * i}>
              <li
                className={cn(
                  "flex h-full flex-col rounded-card border border-civic-mist/15 bg-civic-deep/60 p-6 backdrop-blur-sm",
                  "transition duration-300 hover:border-civic-gold/40 hover:bg-civic-deep/80",
                )}
              >
                <h3 className="font-heading text-lg font-bold text-civic-gold-soft">{b.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-civic-mist/82 md:text-[0.9375rem]">{b.body}</p>
              </li>
            </FadeInWhenVisible>
          ))}
        </ul>
      </ContentContainer>
    </section>
  );
}
