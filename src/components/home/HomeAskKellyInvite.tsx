"use client";

import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { requestOpenCampaignGuide } from "@/lib/campaign-guide/open";

/**
 * Homepage entry to Ask Kelly — opens the existing floating guide; no admin routes exposed.
 */
export function HomeAskKellyInvite() {
  return (
    <section
      className="border-y border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      id="ask-kelly-home"
      aria-labelledby="ask-kelly-home-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-2xl rounded-card border border-kelly-navy/12 bg-kelly-mist/25 p-8 text-center shadow-sm md:p-10">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Ask Kelly</p>
          <h2 id="ask-kelly-home-heading" className="mt-4 font-heading text-[clamp(1.5rem,3.2vw,2.1rem)] font-bold tracking-tight text-kelly-ink">
            Have a question about Kelly, the office, or the campaign?
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">
            Ask in plain language. You’ll get thoughtful, public-facing replies—grounded in Kelly’s priorities and, when helpful,
            pointers to official sources.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-btn bg-kelly-navy px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:bg-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
            onClick={() => requestOpenCampaignGuide()}
          >
            Ask Kelly
          </button>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
