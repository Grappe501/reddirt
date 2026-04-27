import Link from "next/link";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { SocialFooterIcons } from "@/components/layout/SocialFooterIcons";
import { footerNavGroups, powerOf5OnboardingHref } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { isExternalHref } from "@/lib/href";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-kelly-gold/20 bg-kelly-navy text-kelly-page">
      <ContentContainer className="py-section-y lg:py-section-y-lg">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-4">
            <p className="font-heading text-2xl font-bold tracking-tight">{siteConfig.name}</p>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-kelly-page/75">
              {siteConfig.description}
            </p>
            <Link
              href={powerOf5OnboardingHref}
              className="mt-6 inline-flex rounded-btn border border-kelly-page/25 bg-kelly-page/10 px-4 py-2.5 font-body text-sm font-semibold text-kelly-page transition hover:border-kelly-gold/50 hover:bg-kelly-page/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
            >
              Start Power of 5 →
            </Link>
            <p className="mt-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-page/50">
              Follow the campaign
            </p>
            <SocialFooterIcons className="mt-3" />
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-10 lg:col-span-8">
            {footerNavGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-page/50">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => {
                    const href = item.label === "Donate" ? siteConfig.donateHref : item.href;
                    const ext = isExternalHref(href);
                    return (
                      <li key={`${item.label}-${item.href}`}>
                        <Link
                          href={href}
                          target={ext ? "_blank" : undefined}
                          rel={ext ? "noopener noreferrer" : undefined}
                          className="font-body text-sm text-kelly-page/85 transition hover:text-kelly-gold focus-visible:outline-none focus-visible:underline"
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-kelly-page/15 pt-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
            <CampaignPaidForBar variant="dark" />
            <p className="font-body text-[9px] leading-snug text-kelly-page/45">
              © {year} {siteConfig.name}. All rights reserved.
            </p>
          </div>
        </div>
      </ContentContainer>
    </footer>
  );
}
