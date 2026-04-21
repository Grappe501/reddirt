import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FIGHT_FOR } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export function HomeFightForSection() {
  return (
    <section className="bg-civic-mist/50 py-section-y lg:py-section-y-lg" aria-labelledby="fight-for-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">Commitments</p>
          <h2
            id="fight-for-heading"
            className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-civic-ink"
          >
            What Kelly Will Fight For
          </h2>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:gap-8">
          {FIGHT_FOR.map((item, i) => (
            <FadeInWhenVisible
              key={item.title}
              delay={0.07 * i}
              className={cn(i % 2 === 1 && "lg:mt-8")}
            >
              <article className="h-full rounded-card border border-civic-ink/10 bg-white/90 p-7 shadow-sm backdrop-blur-sm md:p-8 lg:p-9">
                <h3 className="font-heading text-xl font-bold leading-snug text-civic-ink lg:text-2xl">{item.title}</h3>
                <p className="mt-4 font-body text-base leading-relaxed text-civic-slate/92">{item.body}</p>
              </article>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 flex justify-center lg:mt-16">
          <Link
            href="/priorities"
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-civic-blue/40 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-blue transition hover:border-civic-gold hover:bg-white"
          >
            Explore the Priorities
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
