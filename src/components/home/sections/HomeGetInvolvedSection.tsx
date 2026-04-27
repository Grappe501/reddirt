import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { GET_INVOLVED_SECTION } from "@/content/home/homepagePremium";
import { getCampaignBlogUrl, getJoinCampaignHref } from "@/config/external-campaign";
import { siteConfig } from "@/config/site";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    title: "Volunteer",
    body: "Sign up on this site—tell us how you’d like to help locally or online.",
    href: getJoinCampaignHref(),
    cta: "Open volunteer form",
  },
  {
    title: "Become an Organizer",
    body: "Lead in your county or community—with training and a team that shares the load.",
    href: "/start-a-local-team",
    cta: "Start locally",
  },
  {
    title: "Donate",
    body: "Power a campaign built for Arkansas—not insiders.",
    href: siteConfig.donateHref,
    cta: "Donate",
  },
  {
    title: "Stay Connected",
    body: "Follow the road journal on Substack—stories, speeches, and campaign moments in Kelly’s voice.",
    href: getCampaignBlogUrl(),
    cta: "Read on Substack",
  },
] as const;

export function HomeGetInvolvedSection() {
  return (
    <div
      className="bg-white py-section-y lg:py-section-y-lg"
      role="region"
      aria-labelledby="get-involved-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">{GET_INVOLVED_SECTION.eyebrow}</p>
          <h2
            id="get-involved-heading"
            className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-kelly-ink"
          >
            {GET_INVOLVED_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">{GET_INVOLVED_SECTION.subtitle}</p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {ACTIONS.map((a, i) => (
            <FadeInWhenVisible key={a.title} delay={0.06 * i}>
              <Link
                href={a.href}
                target={isExternalHref(a.href) ? "_blank" : undefined}
                rel={isExternalHref(a.href) ? "noopener noreferrer" : undefined}
                className={cn(
                  "group flex h-full flex-col justify-between rounded-card border border-kelly-ink/10 bg-kelly-fog/40 p-7 shadow-sm",
                  "transition duration-300 hover:-translate-y-1 hover:border-kelly-gold/40 hover:bg-white hover:shadow-xl",
                )}
              >
                <div>
                  <h3 className="font-heading text-xl font-bold text-kelly-ink group-hover:text-kelly-blue">{a.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate/90 md:text-base">{a.body}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-body text-sm font-bold text-kelly-navy">
                  {a.cta}
                  <span className="transition group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            </FadeInWhenVisible>
          ))}
        </div>
      </ContentContainer>
    </div>
  );
}
