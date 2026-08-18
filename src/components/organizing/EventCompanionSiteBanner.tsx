import Link from "next/link";

import { Button } from "@/components/ui/Button";

type Props = {
  href: string;
  label?: string;
  eventTitle: string;
};

/**
 * Prominent banner when an event has a dedicated companion microsite (tickets/details live there).
 */
export function EventCompanionSiteBanner({
  href,
  label = "Visit the event website",
  eventTitle,
}: Props) {
  return (
    <div
      className="border-b border-kelly-gold/45 bg-gradient-to-r from-kelly-navy via-kelly-blue to-kelly-navy text-kelly-mist"
      role="region"
      aria-label="Event website"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-[var(--gutter-x)] py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="min-w-0">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold/95">
            Full event site
          </p>
          <p className="mt-1 font-heading text-base font-bold text-white md:text-lg">
            {eventTitle} has its own home on the web
          </p>
          <p className="mt-1 font-body text-sm leading-relaxed text-kelly-mist/90">
            Music, dinner, tickets, table hosting, and the Kelly &amp; David story — explore the celebration before you
            arrive.
          </p>
        </div>
        <Button
          href={href}
          variant="primary"
          className="w-full shrink-0 bg-kelly-gold text-kelly-deep hover:bg-kelly-gold-soft sm:w-auto"
        >
          {label}
        </Button>
      </div>
      <p className="mx-auto max-w-5xl px-[var(--gutter-x)] pb-3 font-body text-xs text-kelly-mist/75">
        Campaign calendar listing ·{" "}
        <Link href={href} className="font-semibold text-kelly-gold underline underline-offset-2">
          Open event website
        </Link>
      </p>
    </div>
  );
}
