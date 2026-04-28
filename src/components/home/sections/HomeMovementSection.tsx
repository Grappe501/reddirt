import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";
import type { movementBeliefs } from "@/content/homepage";

type Belief = (typeof movementBeliefs)[number];

export function HomeMovementSection({ items }: { items: readonly Belief[] | Belief[] }) {
  return (
    <section className="bg-kelly-navy py-section-y text-white lg:py-section-y-lg" aria-labelledby="movement-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.26em] text-kelly-gold-soft">What guides us</p>
          <h2 id="movement-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-white">
            What this campaign is accountable to
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-white/85 md:text-lg">
            The same commitments you’ll hear on the trail and in how we talk with clerks, voters, and neighbors.
          </p>
        </FadeInWhenVisible>
        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {items.map((b, i) => (
            <FadeInWhenVisible key={b.title} delay={0.05 * i}>
              <li
                className={cn(
                  "flex h-full flex-col rounded-card border border-white/15 bg-kelly-deep/60 p-6 backdrop-blur-sm",
                  "transition duration-300 hover:border-kelly-gold/40 hover:bg-kelly-deep/80",
                )}
              >
                <h3 className="font-heading text-lg font-bold text-kelly-gold-soft">{b.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/88 md:text-[0.9375rem]">{b.body}</p>
              </li>
            </FadeInWhenVisible>
          ))}
        </ul>
      </ContentContainer>
    </section>
  );
}
