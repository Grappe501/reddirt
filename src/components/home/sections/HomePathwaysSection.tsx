import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import type { pathwayCards } from "@/content/homepage";

type Card = (typeof pathwayCards)[number];

export function HomePathwaysSection({ cards }: { cards: readonly Card[] | Card[] }) {
  return (
    <section className="border-y border-kelly-ink/10 bg-kelly-page py-section-y lg:py-section-y-lg" aria-labelledby="pathways-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-blue">Take a next step</p>
          <h2 id="pathways-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink">
            Ways to go deeper
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
            Each card links to a real page—priorities, ballot access, local organizing, and stories from Arkansas.
          </p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => {
            const ext = isExternalHref(c.href);
            return (
              <FadeInWhenVisible key={c.title} delay={0.05 * i}>
                <Link
                  href={c.href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  className={cn(
                    "group flex h-full flex-col justify-between rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm md:p-7",
                    "transition duration-300 hover:-translate-y-0.5 hover:border-kelly-navy/35 hover:shadow-lg",
                  )}
                >
                  <div>
                    <h3 className="font-heading text-xl font-bold text-kelly-ink group-hover:text-kelly-navy">{c.title}</h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate/92 md:text-base">{c.description}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 font-body text-sm font-bold text-kelly-blue">
                    {c.ctaLabel}
                    <span className="transition group-hover:translate-x-1" aria-hidden>
                      →
                    </span>
                  </span>
                </Link>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </ContentContainer>
    </section>
  );
}
