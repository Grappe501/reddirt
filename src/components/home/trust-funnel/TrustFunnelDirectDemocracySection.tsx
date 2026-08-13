import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  ballotInitiativeProcessHref,
} from "@/config/direct-democracy-links";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";

const copy = trustFunnelHomeCopy.directDemocracy;

export function TrustFunnelDirectDemocracySection() {
  return (
    <section
      id="direct-democracy"
      className="border-t border-kelly-gold/30 bg-gradient-to-b from-kelly-gold/[0.08] via-kelly-wash to-white py-section-y lg:py-section-y-lg"
      aria-labelledby="direct-democracy-heading"
    >
      <ContentContainer>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
          <ScrollReveal className="lg:col-span-5">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{copy.eyebrow}</p>
            <h2 id="direct-democracy-heading" className="mt-3 font-heading text-3xl font-bold text-kelly-ink md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.lead}</p>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate/90">{copy.body}</p>
          </ScrollReveal>

          <ScrollReveal delay={80} className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-2">
              {copy.pillars.map((pillar) => (
                <li
                  key={pillar.title}
                  className="rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]"
                >
                  <h3 className="font-heading text-lg font-bold text-kelly-navy">{pillar.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{pillar.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={ballotInitiativeProcessHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-kelly-blue"
              >
                {copy.ctas.process}
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-gold/50 bg-kelly-gold/15 px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold/25"
              >
                {copy.ctas.commitment}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </ContentContainer>
    </section>
  );
}
