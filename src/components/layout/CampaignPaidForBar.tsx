import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";

type Props = {
  /** Dark background (footer) vs light band (admin) */
  variant?: "dark" | "light";
};

/**
 * FEC-style “paid for” line — required on every public and admin surface.
 * Wording comes from `CAMPAIGN_POLICY_V1` (POLICY-1); optional `NEXT_PUBLIC_COMMITTEE_SITE_URL` links the campaign site.
 */
function linkLabelForHref(href: string): string {
  try {
    if (href.startsWith("http")) {
      return new URL(href).hostname.replace(/^www\./, "");
    }
  } catch {
    /* fall through */
  }
  return "Campaign site";
}

export function CampaignPaidForBar({ variant = "dark" }: Props) {
  const committeeHref = process.env.NEXT_PUBLIC_COMMITTEE_SITE_URL?.trim() || siteConfig.url;
  const isDark = variant === "dark";
  return (
    <p
      className={
        isDark
          ? "text-center font-body text-[11px] font-medium uppercase tracking-[0.12em] text-white/60"
          : "text-center font-body text-[10px] font-medium uppercase tracking-[0.12em] text-kelly-text/55"
      }
    >
      {CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine} ·{" "}
      <Link
        href={committeeHref}
        className={
          isDark
            ? "text-white/80 underline-offset-2 hover:text-white hover:underline"
            : "text-kelly-navy underline-offset-2 hover:underline"
        }
      >
        {linkLabelForHref(committeeHref)}
      </Link>
    </p>
  );
}
