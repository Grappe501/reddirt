import Link from "next/link";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { SocialFooterIcons } from "@/components/layout/SocialFooterIcons";
import { getVolunteerSignupHref } from "@/config/external-campaign";
import { footerNavGroups } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { isExternalHref } from "@/lib/href";

const footerColumns = [
  [footerNavGroups[0], footerNavGroups[1]],
  [footerNavGroups[2]],
  [footerNavGroups[3]],
  [footerNavGroups[4], footerNavGroups[5]],
] as const;

function FooterNavGroup({ title, items }: (typeof footerNavGroups)[number]) {
  return (
    <nav aria-label={title}>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-kelly-page/50">{title}</p>
      <ul className="mt-1.5">
        {items.map((item) => {
          const href = item.label === "Donate" ? siteConfig.donateHref : item.href;
          const ext = isExternalHref(href);
          return (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
                className="block py-px font-body text-sm leading-snug text-kelly-page/85 transition hover:text-kelly-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const volunteerHref = getVolunteerSignupHref();
  const volunteerExternal = isExternalHref(volunteerHref);

  return (
    <footer className="w-full border-t border-kelly-gold/25 bg-gradient-to-b from-kelly-navy to-kelly-deep text-kelly-page">
      <ContentContainer className="py-8 lg:py-10">
        <div className="flex flex-col gap-4 border-b border-kelly-page/12 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="font-heading text-lg font-bold tracking-tight md:text-xl">{siteConfig.name}</p>
            <p className="mt-1 font-body text-sm leading-snug text-kelly-page/70">{siteConfig.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href={volunteerHref}
              target={volunteerExternal ? "_blank" : undefined}
              rel={volunteerExternal ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-[40px] items-center justify-center rounded-btn bg-gradient-to-b from-kelly-gold to-[#b8872f] px-4 py-2 font-body text-sm font-bold text-kelly-navy shadow-[var(--shadow-gold-cta)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
            >
              Volunteer with Kelly →
            </Link>
            <Link
              href="/contact"
              className="font-body text-sm font-semibold text-kelly-page underline decoration-kelly-page/30 underline-offset-4 transition hover:text-kelly-gold hover:decoration-kelly-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
            >
              Contact the campaign
            </Link>
            <SocialFooterIcons />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 md:gap-x-8">
          {footerColumns.map((column) => (
            <div key={column.map((g) => g.title).join("-")} className="space-y-4">
              {column.map((group) => (
                <FooterNavGroup key={group.title} title={group.title} items={group.items} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-kelly-page/15 pt-4">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 text-center">
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
