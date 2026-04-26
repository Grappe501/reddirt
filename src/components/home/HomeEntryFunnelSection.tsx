import Link from "next/link";

import { getJoinCampaignHref } from "@/config/external-campaign";
import { cn } from "@/lib/utils";

/**
 * Pass 02 — structured public entry funnel (four canonical pathways).
 * Uses existing routes only; no engine surfaces.
 */
const ENTRY_BLOCKS = [
  {
    key: "volunteer",
    title: "Start as a Volunteer",
    line: "Pick a lane—field, events, digital, or neighbor-to-neighbor—and we’ll help you plug in safely.",
    href: getJoinCampaignHref(),
    cta: "Start volunteering",
  },
  {
    key: "county",
    title: "Lead in Your County",
    line: "County teams, trainings, and gatherings that respect Arkansas—without needing a title to begin.",
    href: "/local-organizing",
    cta: "Explore county leadership",
  },
  {
    key: "candidate",
    title: "Run for Office",
    line: "Toolkits and materials if you’re running or helping a race—paired with what this office really does.",
    href: "/resources",
    cta: "Open toolkits",
  },
  {
    key: "supporter",
    title: "Support the Work",
    line: "Chip in, follow the trail, and help more Arkansans see a fair, understandable process.",
    href: "/donate",
    cta: "Donate",
  },
] as const;

export function HomeEntryFunnelSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative border-b border-civic-ink/10 bg-gradient-to-b from-white via-civic-fog/40 to-civic-fog/20 py-6 lg:py-8",
        className,
      )}
      aria-label="Ways to plug in"
    >
      <div className="mx-auto max-w-content px-[var(--gutter-x)]">
        <div className="mb-5 max-w-3xl">
          <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-civic-slate/80">
            Find your path
          </p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-civic-ink lg:text-3xl">
            Four ways into this campaign
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-civic-slate/95 lg:text-base">
            Same movement—different doors. Choose the lane that fits your life; everything here links to pages
            already on this site.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {ENTRY_BLOCKS.map((b) => (
            <div
              key={b.key}
              className={cn(
                "group flex flex-col rounded-card border border-civic-ink/10 bg-white/95 p-6 shadow-sm backdrop-blur-sm",
                "transition duration-300 hover:border-civic-gold/45 hover:shadow-xl",
              )}
            >
              <h3 className="font-heading text-lg font-bold text-civic-ink group-hover:text-civic-blue">{b.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-civic-slate/95">{b.line}</p>
              <div className="mt-6 border-t border-civic-ink/8 pt-5">
                <Link
                  href={b.href}
                  className="inline-flex font-body text-sm font-bold uppercase tracking-wider text-red-dirt transition hover:text-civic-blue"
                >
                  {b.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
