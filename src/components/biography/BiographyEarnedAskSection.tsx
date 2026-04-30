import { getJoinCampaignHref } from "@/config/external-campaign";
import { powerOf5OnboardingHref } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { biographyConversionCopy } from "@/content/biography/biography-reading-experience";
import { Button } from "@/components/ui/Button";
import { BiographyShareStoryButton } from "@/components/biography/BiographyShareStoryButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const conv = biographyConversionCopy;

export function BiographyEarnedAskSection() {
  const volHref = getJoinCampaignHref();
  const volExt = isExternalHref(volHref);
  const donateExternal = /^https?:\/\//i.test(siteConfig.donateHref.trim());
  const [volCard, fiveCard, donateCard] = conv.what.cards;

  return (
    <section
      id="biography-earned-ask"
      aria-labelledby="biography-earned-ask-heading"
      className="border-t border-kelly-text/10 bg-kelly-navy text-white"
    >
      {/* Breathing room before the ask — feels like landing after the story, not a popup */}
      <div className="bg-gradient-to-b from-kelly-wash via-kelly-wash/95 to-kelly-navy px-[var(--gutter-x)] pb-16 pt-20 sm:pb-20 sm:pt-24 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-2xl text-center font-body text-base leading-relaxed text-kelly-text/85 md:text-lg">
          <p>{conv.bridge}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-[var(--gutter-x)] pb-4 pt-2 text-center md:pb-6">
        <h2 id="biography-earned-ask-heading" className="font-heading text-2xl font-bold text-white md:text-3xl">
          {conv.title}
        </h2>

        <div className="mt-12 space-y-8 text-left font-body leading-relaxed text-white/88 md:mt-14">
          <ScrollReveal yOffset={8}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.why.title}</h3>
              <p className="mt-3 text-base md:text-[1.05rem]">{conv.why.body}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal yOffset={8} delay={40}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.how.title}</h3>
              <p className="mt-3 text-base md:text-[1.05rem]">{conv.how.body}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal yOffset={8} delay={80}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.what.title}</h3>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-[var(--gutter-x)] pb-section-y lg:pb-section-y-lg">
        <ul className="grid list-none gap-6 sm:gap-8 md:grid-cols-3 md:gap-5">
          <ScrollReveal as="li" yOffset={12} delay={60}>
            <div className="flex h-full flex-col rounded-card border border-white/20 bg-kelly-blue/25 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)] md:p-7">
              <h3 className="font-heading text-lg font-bold text-kelly-gold">{volCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/85">{volCard.body}</p>
              <Button href={volHref} variant="outlineOnDark" className="mt-6 w-full border-2 border-kelly-gold/60 font-bold">
                {volCard.cta}
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal as="li" yOffset={12} delay={100}>
            <div className="flex h-full flex-col rounded-card border-2 border-kelly-gold/35 bg-kelly-blue/30 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.22)] ring-1 ring-kelly-gold/15 md:p-7 md:ring-2 md:ring-kelly-gold/20">
              <h3 className="font-heading text-lg font-bold text-kelly-gold">{fiveCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/90">{fiveCard.body}</p>
              <div className="mt-6 flex flex-col gap-3">
                <Button href={powerOf5OnboardingHref} variant="outlineOnDark" className="w-full border-2 border-kelly-gold/60 font-bold">
                  Bring 5 Friends
                </Button>
                <BiographyShareStoryButton variant="onDark" className="w-full">
                  {fiveCard.cta}
                </BiographyShareStoryButton>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal as="li" yOffset={12} delay={140}>
            <div className="flex h-full flex-col rounded-card border border-white/12 bg-kelly-navy/50 p-6 opacity-[0.97] md:p-7">
              <h3 className="font-heading text-lg font-semibold text-white/95">{donateCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/78">{donateCard.body}</p>
              <Button
                href={siteConfig.donateHref}
                variant="ghostOnDark"
                className="mt-6 w-full border border-white/28 py-3 text-white/90"
                {...(donateExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {donateCard.cta}
              </Button>
            </div>
          </ScrollReveal>
        </ul>
      </div>

      <p className="mx-auto mt-2 max-w-xl px-[var(--gutter-x)] pb-10 text-center font-body text-xs text-white/60">
        Volunteer opens your sign-up path. Donate uses the committee’s secure page when hosted off-site.
        {volExt ? (
          <>
            {" "}
            <span className="whitespace-nowrap">Volunteer may open in a new tab.</span>
          </>
        ) : null}
      </p>
    </section>
  );
}
