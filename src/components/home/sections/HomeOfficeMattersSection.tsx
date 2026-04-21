import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { OFFICE_MATTERS } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export function HomeOfficeMattersSection() {
  return (
    <section
      className="bg-cream-canvas py-section-y lg:py-section-y-lg"
      aria-labelledby="office-matters-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center md:max-w-4xl">
          <h2
            id="office-matters-heading"
            className="font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-civic-ink"
          >
            Why This Office Matters
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            The Secretary of State’s office is not just paperwork and procedure. It shapes election administration,
            business filings, public transparency, and the systems that help citizens participate in democracy.
          </p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:mt-16">
          {OFFICE_MATTERS.map((c, i) => (
            <FadeInWhenVisible key={c.title} delay={0.06 * i}>
              <article
                className={cn(
                  "group relative h-full overflow-hidden rounded-card border border-civic-ink/10 bg-white p-7 shadow-[var(--shadow-soft)] md:p-8",
                  "transition duration-300 hover:border-civic-gold/30 hover:shadow-[0_16px_48px_rgba(12,18,34,0.1)]",
                )}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-civic-gold to-civic-gold/20 opacity-90 transition-all group-hover:w-1.5"
                  aria-hidden
                />
                <h3 className="pl-3 font-heading text-xl font-bold text-civic-ink md:text-2xl">{c.title}</h3>
                <p className="mt-4 pl-3 font-body text-base leading-relaxed text-civic-slate/90">{c.body}</p>
              </article>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 flex justify-center md:mt-16">
          <Link
            href="/priorities"
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-civic-midnight px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-mist transition hover:bg-civic-deep"
          >
            See the Plan
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
