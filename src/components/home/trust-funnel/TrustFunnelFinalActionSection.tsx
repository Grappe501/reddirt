import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getVolunteerSignupHref } from "@/config/external-campaign";
import { siteConfig } from "@/config/site";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  trustFunnelCtaOutline,
  trustFunnelCtaPrimary,
} from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.finalAction;

/**
 * Closing ask — Power of 5, volunteer, host, donate.
 */
export function TrustFunnelFinalActionSection() {
  const volunteerHref = getVolunteerSignupHref();

  const actions = [
    { label: copy.ctas.join, href: "/get-involved/bring-5", variant: "primary" as const },
    { label: copy.ctas.volunteer, href: volunteerHref, variant: "outline" as const },
    { label: copy.ctas.priorities, href: "/events/request", variant: "outline" as const },
    { label: copy.ctas.donate, href: siteConfig.donateHref, variant: "outline" as const, external: true },
  ];

  return (
    <section
      id="take-action"
      className="border-t border-kelly-gold/25 bg-kelly-wash/80 py-section-y lg:py-section-y-lg"
      aria-labelledby="final-action-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center" yOffset={6}>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-kelly-gold">{copy.mottoLatin}</p>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-kelly-ink md:text-4xl">{copy.mottoEnglish}</p>
          <div className="mx-auto mt-5 h-px w-16 bg-kelly-gold/50" aria-hidden />
          <h2 id="final-action-heading" className="mt-8 font-heading text-xl font-bold tracking-tight text-kelly-ink md:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.body}</p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {actions.map((cta) => {
              const className = cn(cta.variant === "primary" ? trustFunnelCtaPrimary : trustFunnelCtaOutline);

              if (cta.external) {
                return (
                  <a
                    key={cta.label}
                    href={cta.href}
                    className={className}
                    rel="noopener noreferrer"
                    target={cta.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {cta.label}
                  </a>
                );
              }

              return (
                <Link key={cta.label} href={cta.href} className={className}>
                  {cta.label}
                </Link>
              );
            })}
          </div>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
