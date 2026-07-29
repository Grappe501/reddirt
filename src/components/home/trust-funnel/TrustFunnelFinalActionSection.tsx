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

/** Closing ask after trust journey — Join → Volunteer → Priorities; donate available, not interruptive. */
export function TrustFunnelFinalActionSection() {
  const volunteerHref = getVolunteerSignupHref();

  const actions = [
    { label: copy.ctas.join, href: volunteerHref, variant: "primary" as const },
    { label: copy.ctas.volunteer, href: "/get-involved#volunteer", variant: "outline" as const },
    { label: copy.ctas.priorities, href: "/priorities", variant: "outline" as const },
    { label: copy.ctas.donate, href: siteConfig.donateHref, variant: "outline" as const, external: true },
  ];

  return (
    <section
      id="take-action"
      className="border-t border-kelly-ink/10 bg-kelly-wash/80 py-section-y lg:py-section-y-lg"
      aria-labelledby="final-action-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center" yOffset={6}>
          <h2 id="final-action-heading" className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
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
