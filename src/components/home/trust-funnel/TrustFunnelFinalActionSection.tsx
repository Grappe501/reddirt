import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getCampaignBlogUrl, getVolunteerSignupHref } from "@/config/external-campaign";
import { siteConfig } from "@/config/site";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.finalAction;

/** Natural closing ask — no floating donate interruption. */
export function TrustFunnelFinalActionSection() {
  const volunteerHref = getVolunteerSignupHref();
  const blogUrl = getCampaignBlogUrl();

  const actions = [
    { label: copy.ctas.join, href: volunteerHref, variant: "primary" as const },
    { label: copy.ctas.volunteer, href: "/get-involved#volunteer", variant: "secondary" as const },
    { label: copy.ctas.about, href: "/about", variant: "secondary" as const },
    { label: copy.ctas.updates, href: "/get-involved#join", variant: "secondary" as const },
    { label: copy.ctas.blog, href: blogUrl, variant: "secondary" as const, external: true },
    { label: copy.ctas.donate, href: siteConfig.donateHref, variant: "secondary" as const, external: true },
  ];

  return (
    <section
      id="take-action"
      className="border-t border-kelly-ink/10 bg-kelly-wash/80 py-section-y lg:py-section-y-lg"
      aria-labelledby="final-action-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 id="final-action-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{copy.body}</p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {actions.map((cta) => {
              const className =
                cta.variant === "primary"
                  ? "inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                  : "inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy";

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
