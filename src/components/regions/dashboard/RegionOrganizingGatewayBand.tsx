import Link from "next/link";
import type { RegionOrganizingGateway } from "@/lib/campaign-engine/regions/types";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";

type Props = {
  gateway: RegionOrganizingGateway;
  className?: string;
};

const ONBOARDING_POWER_OF_5 = "/onboarding/power-of-5";
const CONVERSATIONS_AND_STORIES = "/messages";

/**
 * Volunteer-facing gateway: region story + CTAs into Power of 5 onboarding and the message hub (Pass 6: `/messages`).
 */
export function RegionOrganizingGatewayBand({ gateway, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-kelly-navy/15 bg-gradient-to-br from-kelly-page via-kelly-page to-kelly-navy/[0.06] p-4 sm:p-6 shadow-sm",
        className,
      )}
      aria-labelledby="region-gateway-heading"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-200/90 bg-amber-50/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
          Public preview
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/60">Demo / seed rollups · not voter data</span>
      </div>
      <h2 id="region-gateway-heading" className="font-heading mt-3 text-xl font-bold text-kelly-navy sm:text-2xl">
        {gateway.headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-kelly-text/85">{gateway.body}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={ONBOARDING_POWER_OF_5}
          className={cn(
            focusRing,
            tapMinSmCompact,
            "w-full rounded-xl bg-kelly-navy px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-kelly-navy/90 sm:w-auto",
          )}
        >
          Start Power of 5 →
        </Link>
        <Link
          href={CONVERSATIONS_AND_STORIES}
          className={cn(
            focusRing,
            tapMinSmCompact,
            "w-full rounded-xl border-2 border-kelly-navy/25 bg-kelly-page px-5 py-2.5 text-sm font-extrabold text-kelly-navy hover:border-kelly-navy/40 sm:w-auto",
          )}
        >
          Conversations &amp; Stories →
        </Link>
      </div>
      <p className="mt-3 text-xs text-kelly-text/65">
        Member hub URL: <code className="rounded bg-kelly-text/5 px-1">/messages</code> — also linked from the site header.
      </p>
    </section>
  );
}
