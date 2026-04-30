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
  const [volCard, donateCard, fiveCard] = conv.what.cards;

  return (
    <section
      id="biography-earned-ask"
      aria-labelledby="biography-earned-ask-heading"
      className="border-t border-kelly-gold/25 bg-kelly-navy py-section-y text-white lg:py-section-y-lg"
    >
      <div className="mx-auto max-w-3xl px-[var(--gutter-x)] text-center">
        <h2 id="biography-earned-ask-heading" className="font-heading text-2xl font-bold md:text-3xl">
          {conv.title}
        </h2>

        <div className="mt-10 space-y-8 text-left font-body leading-relaxed text-white/88">
          <ScrollReveal yOffset={8}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.why.title}</h3>
              <p className="mt-2 text-base">{conv.why.body}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal yOffset={8} delay={40}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.how.title}</h3>
              <p className="mt-2 text-base">{conv.how.body}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal yOffset={8} delay={80}>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-gold/95">{conv.what.title}</h3>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-5xl px-[var(--gutter-x)]">
        <ul className="grid list-none gap-6 md:grid-cols-3">
          <ScrollReveal as="li" yOffset={12} delay={60}>
            <div className="flex h-full flex-col rounded-card border border-white/20 bg-kelly-blue/25 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
              <h3 className="font-heading text-lg font-bold text-kelly-gold">{volCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/85">{volCard.body}</p>
              <Button href={volHref} variant="outlineOnDark" className="mt-5 w-full border-2 border-kelly-gold/60 font-bold">
                {volCard.cta}
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal as="li" yOffset={12} delay={100}>
            <div className="flex h-full flex-col rounded-card border border-white/15 bg-kelly-navy/60 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <h3 className="font-heading text-lg font-bold text-white">{donateCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/82">{donateCard.body}</p>
              <Button
                href={siteConfig.donateHref}
                variant="ghostOnDark"
                className="mt-5 w-full border border-white/35 font-semibold"
                {...(donateExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {donateCard.cta}
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal as="li" yOffset={12} delay={140}>
            <div className="flex h-full flex-col rounded-card border border-white/20 bg-kelly-blue/20 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
              <h3 className="font-heading text-lg font-bold text-kelly-gold">{fiveCard.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-white/85">{fiveCard.body}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button
                  href={powerOf5OnboardingHref}
                  variant="outlineOnDark"
                  className="w-full border-2 border-kelly-gold/50 font-bold"
                >
                  Bring 5 Friends
                </Button>
                <BiographyShareStoryButton className="w-full">{fiveCard.cta}</BiographyShareStoryButton>
              </div>
            </div>
          </ScrollReveal>
        </ul>
      </div>

      <p className="mx-auto mt-12 max-w-xl px-[var(--gutter-x)] text-center font-body text-xs text-white/65">
        Volunteer link opens the campaign volunteer sign-up. Donate follows the committee’s secure page when hosted off-site.
        {volExt ? (
          <>
            {" "}
            <span className="whitespace-nowrap">Volunteer opens in a new tab.</span>
          </>
        ) : null}
      </p>
    </section>
  );
}
