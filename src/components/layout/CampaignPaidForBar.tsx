import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";

type Props = {
  /** Dark background (footer) vs light band (admin) */
  variant?: "dark" | "light";
};

/**
 * FEC-style “paid for” line — required on every public and admin surface.
 * Wording comes from `CAMPAIGN_POLICY_V1` (POLICY-1).
 * The visible website is the launch domain; the href stays on this development site until DNS cutover.
 */
export function CampaignPaidForBar({ variant = "dark" }: Props) {
  const isDark = variant === "dark";
  return (
    <p
      className={
        isDark
          ? "text-center font-body text-[11px] font-medium uppercase tracking-[0.12em] text-kelly-page/55"
          : "text-center font-body text-[10px] font-medium uppercase tracking-[0.12em] text-kelly-text/55"
      }
    >
      {CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine} ·{" "}
      <Link
        href="/"
        className={
          isDark
            ? "text-kelly-page/75 underline-offset-2 hover:text-kelly-page hover:underline"
            : "text-kelly-navy underline-offset-2 hover:underline"
        }
      >
        {siteConfig.publicDisplayHost}
      </Link>
    </p>
  );
}
