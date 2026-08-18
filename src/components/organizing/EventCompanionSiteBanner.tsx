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
      className="border-b-2 border-kelly-gold/60 bg-gradient-to-r from-kelly-navy via-kelly-blue to-kelly-navy text-kelly-mist shadow-[0_8px_32px_rgba(15,36,62,0.35)]"
      role="region"
      aria-label="Event website"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-[var(--gutter-x)] py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
        <Button
          href={href}
          variant="primary"
          className="order-first w-full shrink-0 min-h-[56px] px-8 text-base font-bold shadow-[0_8px_28px_rgba(202,145,61,0.55)] ring-2 ring-white/25 sm:order-last sm:w-auto sm:min-w-[16rem] sm:text-lg"
        >
          {label} →
        </Button>
        <div className="order-last min-w-0 sm:order-first sm:pr-4">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold/95">
            Full event site
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-white md:text-2xl">
            {eventTitle} has its own home on the web
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-kelly-mist/90 md:text-base">
            Music, dinner, tickets, table hosting, and the Kelly &amp; David story — explore the celebration before you
            arrive.
          </p>
        </div>
      </div>
      <p className="mx-auto max-w-5xl px-[var(--gutter-x)] pb-4 font-body text-xs text-kelly-mist/75 sm:pb-5">
        Campaign calendar listing ·{" "}
        <Link href={href} className="font-semibold text-kelly-gold underline underline-offset-2 hover:text-white">
          Open event website
        </Link>
      </p>
    </div>
  );
}
