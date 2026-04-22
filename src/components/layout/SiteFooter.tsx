import Link from "next/link";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { footerNavGroups } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { isExternalHref } from "@/lib/href";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const joinHref = getJoinCampaignHref();
  const joinExternal = isExternalHref(joinHref);

  return (
    <footer className="w-full border-t border-civic-gold/20 bg-civic-midnight text-cream-canvas">
      <ContentContainer className="py-section-y lg:py-section-y-lg">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-4">
            <p className="font-heading text-2xl font-bold tracking-tight">{siteConfig.name}</p>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-cream-canvas/75">
              {siteConfig.description}
            </p>
            <Link
              href={joinHref}
              target={joinExternal ? "_blank" : undefined}
              rel={joinExternal ? "noopener noreferrer" : undefined}
              className="mt-6 inline-flex rounded-btn border border-cream-canvas/25 bg-cream-canvas/10 px-4 py-2.5 font-body text-sm font-semibold text-cream-canvas transition hover:border-sunlight-gold/50 hover:bg-cream-canvas/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunlight-gold"
            >
              Volunteer sign-up →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-8">
            {footerNavGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-cream-canvas/50">
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
                          className="font-body text-sm text-cream-canvas/85 transition hover:text-sunlight-gold focus-visible:outline-none focus-visible:underline"
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
        <div className="mt-12 space-y-4 border-t border-cream-canvas/15 pt-8">
          <CampaignPaidForBar variant="dark" />
          <p className="text-center font-body text-sm text-cream-canvas/50 sm:text-left">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </ContentContainer>
    </footer>
  );
}
