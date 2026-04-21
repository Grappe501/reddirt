import Link from "next/link";
import { siteConfig } from "@/config/site";

type Props = {
  /** Dark background (footer) vs light band (admin) */
  variant?: "dark" | "light";
};

/**
 * FEC-style “paid for” line — required on every public and admin surface.
 * Optional `NEXT_PUBLIC_COMMITTEE_SITE_URL` links “the campaign” to your preferred site (e.g. RedDirt / main domain).
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
          ? "text-center font-body text-[11px] font-medium uppercase tracking-[0.12em] text-cream-canvas/55"
          : "text-center font-body text-[10px] font-medium uppercase tracking-[0.12em] text-deep-soil/55"
      }
    >
      Paid for by the Committee to Elect Kelly Grappe ·{" "}
      <Link
        href={committeeHref}
        className={
          isDark
            ? "text-cream-canvas/75 underline-offset-2 hover:text-cream-canvas hover:underline"
            : "text-red-dirt underline-offset-2 hover:underline"
        }
      >
        {linkLabelForHref(committeeHref)}
      </Link>
    </p>
  );
}
