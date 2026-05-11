import Link from "next/link";

import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { SocialFooterIcons } from "@/components/layout/SocialFooterIcons";
import { getResourceRequestMailtoHref } from "@/lib/campaign-links";

/**
 * Compact, campaign-compliant footer for Volunteer OS dashboards (not the full marketing SiteFooter).
 */
export function DashboardCompactFooter() {
  const helpMail = getResourceRequestMailtoHref();

  return (
    <footer className="border-t border-kelly-text/10 bg-kelly-fog/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-3">
        <div className="min-w-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-center md:text-left">
          <nav aria-label="Dashboard utilities" className="flex flex-wrap justify-center gap-x-4 gap-y-1 md:justify-start">
            <Link
              href="/volunteer/resources/glossary"
              className="font-body text-xs font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Glossary
            </Link>
            <Link
              href="/volunteer/resources/faq"
              className="font-body text-xs font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              FAQ
            </Link>
            <Link
              href="/volunteer/resources"
              className="font-body text-xs font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/field-playbook"
              className="font-body text-xs font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Field playbook
            </Link>
            <Link href="/privacy" className="font-body text-xs font-semibold text-kelly-navy/80 underline-offset-2 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="font-body text-xs font-semibold text-kelly-navy/80 underline-offset-2 hover:underline">
              Terms
            </Link>
          </nav>
          <a
            href={helpMail}
            className="font-body text-xs font-semibold text-kelly-blue underline-offset-2 hover:underline"
          >
            Contact / help
          </a>
        </div>
        <div className="flex justify-center md:justify-end">
          <SocialFooterIcons surface="light" className="justify-center" />
        </div>
      </div>
      <div className="border-t border-kelly-text/10 bg-white/60 px-4 py-2 md:px-6">
        <CampaignPaidForBar variant="light" />
      </div>
    </footer>
  );
}
