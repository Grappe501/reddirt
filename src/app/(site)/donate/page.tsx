import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { DASS_ARKANSAS_2026 } from "@/config/campaign-partners";
import { siteConfig } from "@/config/site";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Donate",
  description: "Power a Secretary of State campaign built for Arkansas—not insiders.",
  path: "/donate",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function DonatePage() {
  const donate = siteConfig.donateHref;
  const isProcessor = /^https?:\/\//i.test(donate);

  return (
    <>
      <PageHero
        eyebrow="Support the campaign"
        title="Invest in a people-first Arkansas"
        subtitle="You’ll complete your contribution on our secure fundraising page—the same processor linked from KellyGrappe.com."
      >
        {isProcessor ? (
          <Button href={donate} variant="primary">
            Donate now
          </Button>
        ) : (
          <Button href="/get-involved" variant="primary">
            Get involved while we wire donations
          </Button>
        )}
        <Button href="/priorities" variant="outline">
          Read the plan
        </Button>
      </PageHero>
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl rounded-card border border-deep-soil/10 bg-white/60 px-6 py-7 shadow-sm md:px-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-red-dirt/90">National map</p>
          <h2 className="mt-2 font-heading text-lg font-bold text-deep-soil md:text-xl">
            {DASS_ARKANSAS_2026.orgName}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/80 md:text-base">
            DASS spotlights the Arkansas Secretary of State race on its 2026 state page—useful context for anyone following
            pro-voter, pro-democracy work nationwide.
          </p>
          <a
            href={DASS_ARKANSAS_2026.href}
            className="mt-4 inline-flex font-body text-sm font-semibold text-red-dirt underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {DASS_ARKANSAS_2026.linkLabel} (demsofstate.org) ↗
          </a>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-2xl space-y-4 font-body text-base leading-relaxed text-deep-soil/80">
          <p>
            The site defaults to the GoodChange link used on{" "}
            <a className="font-semibold text-red-dirt underline" href="https://www.kellygrappe.com" target="_blank" rel="noopener noreferrer">
              KellyGrappe.com
            </a>
            . Override with{" "}
            <code className="rounded bg-deep-soil/10 px-1.5 py-0.5 font-mono text-sm">NEXT_PUBLIC_DONATE_EXTERNAL_URL</code>{" "}
            if the processor URL changes.
          </p>
          <p className="text-sm text-deep-soil/60">Paid-for-by language belongs in the footer and on this page—replace placeholders before launch.</p>
          <p className="text-sm text-deep-soil/50">{siteConfig.name}</p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
