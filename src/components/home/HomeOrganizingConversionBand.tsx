import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CTASection } from "@/components/blocks/CTASection";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { PowerOf5StepCard } from "@/components/onboarding/power-of-5";
import { CountyKpiCard } from "@/components/county/dashboard/countyDashboardFormat";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { storyPreviews } from "@/content/homepage";
import { TRUST_RIBBON_ITEMS } from "@/content/home/homepagePremium";
import type { MergedHomepageConfig } from "@/lib/content/homepage-merge";
import { countyDashboardSampleHref, powerOf5OnboardingHref } from "@/config/navigation";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

type Props = {
  finalCta: MergedHomepageConfig["finalCta"];
};

/**
 * Pass 2 homepage: organizing-system conversion sections (server-rendered; child `FadeInWhenVisible` is client).
 */
export function HomeOrganizingConversionBand({ finalCta }: Props) {
  const previewStories = storyPreviews.slice(0, 3);

  return (
    <>
      <section
        className="border-y border-kelly-ink/10 bg-kelly-fog/50 py-section-y lg:py-section-y-lg"
        aria-labelledby="power-of-5-explainer-heading"
      >
        <ContentContainer>
          <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Power of 5</p>
            <h2
              id="power-of-5-explainer-heading"
              className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink"
            >
              A simple ladder your county can actually run
            </h2>
            <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
              The Power of 5 is relational organizing with clear stages—so volunteers know what “done” looks like and teams don’t collapse when one person
              gets busy. The guided flow is training-first; it doesn’t collect contacts or voter data on the public path.
            </p>
          </FadeInWhenVisible>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <FadeInWhenVisible delay={0.05}>
              <PowerOf5StepCard title="Name your five" badge="Step 1">
                Start with people you already trust—neighbors, coworkers, faith communities, small-business regulars. The goal isn’t volume; it’s depth you
                can follow up with honestly.
              </PowerOf5StepCard>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.1}>
              <PowerOf5StepCard title="Turn talk into teams" badge="Step 2">
                When two or three people say yes, you’ve got a pod. The public dashboard shells show how completion and coverage read at a county level—so
                the work is visible without exposing private lists.
              </PowerOf5StepCard>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.15}>
              <PowerOf5StepCard title="Keep the rhythm" badge="Step 3">
                Organizing holds when there’s a weekly heartbeat: invites, follow-ups, and a honest read on gaps. That’s what the statewide view is for—
                peer counties, not leaderboards of individuals.
              </PowerOf5StepCard>
            </FadeInWhenVisible>
          </div>
          <FadeInWhenVisible className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={powerOf5OnboardingHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-kelly-navy/90"
            >
              Open the guided flow
            </Link>
            <Link
              href="/organizing-intelligence"
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold"
            >
              See statewide organizing intelligence
            </Link>
          </FadeInWhenVisible>
        </ContentContainer>
      </section>

      <section
        className="bg-white py-section-y lg:py-section-y-lg"
        aria-labelledby="county-dashboard-preview-heading"
      >
        <ContentContainer>
          <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-blue">County command</p>
            <h2
              id="county-dashboard-preview-heading"
              className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink"
            >
              County dashboard preview
            </h2>
            <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
              Every published county gets a shared command shell: KPI strip, battlefield read, Power of 5 block, and regional context. Numbers below are
              demo/seed—placeholders until your county is hydrated from approved sources.
            </p>
          </FadeInWhenVisible>
          <FadeInWhenVisible className="mt-10" delay={0.06}>
            <div
              className={cn(
                countyDashboardCardClass,
                "mx-auto max-w-5xl border-l-4 border-l-kelly-navy/35 p-5 sm:p-6 md:p-8",
              )}
            >
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-text/50">Sample strip · Pope County v2</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <CountyKpiCard
                  label="Registered voters"
                  metric={{ value: 41_820, source: "demo", note: "Public denominator-style figure for training." }}
                  actionHint="Compare turnout and registration help targets."
                  compact
                />
                <CountyKpiCard
                  label="Active Power teams"
                  metric={{ value: 12, source: "demo" }}
                  actionHint="Pods currently meeting the public definition of active."
                  compact
                />
                <CountyKpiCard
                  label="Coverage (demo)"
                  metric={{ value: 38, source: "demo" }}
                  actionHint="Percent-style field coverage placeholder."
                  compact
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={countyDashboardSampleHref}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-kelly-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-kelly-navy/90"
                >
                  Open gold-sample dashboard
                </Link>
                <Link
                  href="/counties"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-btn border border-kelly-text/15 bg-kelly-page px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-kelly-navy hover:border-kelly-gold"
                >
                  Browse all counties
                </Link>
              </div>
            </div>
          </FadeInWhenVisible>
        </ContentContainer>
      </section>

      <section className="border-y border-kelly-ink/10 bg-kelly-mist/35 py-section-y lg:py-section-y-lg" aria-labelledby="messages-preview-heading">
        <ContentContainer>
          <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Conversations &amp; Stories</p>
            <h2 id="messages-preview-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink">
              Prompts, line, and neighbor stories
            </h2>
            <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
              The message hub is the volunteer-facing shelf: weekly narrative line, county color, and share packets. What you see today is demo or seed
              until approvals and comms rails connect.
            </p>
          </FadeInWhenVisible>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {previewStories.map((s, i) => (
              <FadeInWhenVisible key={s.href} delay={0.07 * i}>
                <article className="flex h-full flex-col rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-kelly-gold/30 hover:shadow-lg md:p-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-gold">{s.meta}</p>
                  <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-kelly-ink">{s.title}</h3>
                  <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate/90">{s.excerpt}</p>
                  <Link href={s.href} className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-kelly-navy">
                    {s.ctaLabel}
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              </FadeInWhenVisible>
            ))}
          </div>
          <FadeInWhenVisible className="mt-12 flex justify-center">
            <Link
              href="/messages"
              className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-blue/35 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-blue transition hover:border-kelly-gold"
            >
              Open Conversations &amp; Stories
            </Link>
          </FadeInWhenVisible>
        </ContentContainer>
      </section>

      <FullBleedSection variant="ink-band" id="trust-privacy-home" aria-labelledby="trust-privacy-heading">
        <ContentContainer className="py-section-y lg:py-section-y-lg">
          <header className="mx-auto max-w-3xl text-center text-kelly-page">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">Trust &amp; privacy</p>
            <h2 id="trust-privacy-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-page">
              No surprises with your data—or your time
            </h2>
            <p className="mt-5 font-body text-lg leading-relaxed text-kelly-mist/90 md:text-xl">
              This campaign builds public tools you can read like an organizer: clear labels on demo vs. sourced figures, privacy policies you can find in one
              click, and straightforward language—no hype about magic fixes.
            </p>
          </header>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_RIBBON_ITEMS.map((item, i) => (
              <FadeInWhenVisible key={item.label} delay={0.05 * i}>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-gold">{item.label}</p>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-mist/90">{item.detail}</p>
              </FadeInWhenVisible>
            ))}
          </div>
          <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-kelly-page/20 pt-8 text-center font-body text-sm font-semibold text-kelly-gold">
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:underline">
              Terms of use
            </Link>
            <Link href="/disclaimer" className="underline-offset-4 hover:underline">
              Disclaimer
            </Link>
          </nav>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        id="home-organizing-final-cta"
        eyebrow={finalCta.eyebrow}
        title={finalCta.title}
        description={finalCta.description}
        variant="primary-band"
      >
        <Link
          href={finalCta.primaryHref}
          target={isExternalHref(finalCta.primaryHref) ? "_blank" : undefined}
          rel={isExternalHref(finalCta.primaryHref) ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-kelly-navy shadow-lg transition hover:bg-kelly-gold-soft"
        >
          {finalCta.primaryLabel}
        </Link>
        <Link
          href={finalCta.secondaryHref}
          target={isExternalHref(finalCta.secondaryHref) ? "_blank" : undefined}
          rel={isExternalHref(finalCta.secondaryHref) ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/55 bg-transparent px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-kelly-gold hover:bg-white/10"
        >
          {finalCta.secondaryLabel}
        </Link>
      </CTASection>
    </>
  );
}
