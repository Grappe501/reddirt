"use client";

import Link from "next/link";
import { useJourney } from "@/components/journey/journey-context";
import { cn, focusRing } from "@/lib/utils";
import { countyDashboardSampleHref, getInvolvedPathwaysHref, powerOf5OnboardingHref } from "@/config/navigation";

type PathwayCard = {
  key: string;
  title: string;
  line: string;
  href: string;
  hrefLabel: string;
  /** Deep link into the organizing system */
  chapterHref: string;
  chapterLabel: string;
  /** In-page journey scroll (homepage) */
  beatId?: string;
};

const PATHWAYS: PathwayCard[] = [
  {
    key: "five",
    title: "Build your five",
    line: "Start the trust-first flow: name your five, see the ladder, and learn how teams show up in the public dashboard shells—without sharing private lists online.",
    chapterHref: powerOf5OnboardingHref,
    chapterLabel: "Start Power of 5",
    href: "/messages",
    hrefLabel: "Browse conversation prompts",
  },
  {
    key: "county",
    title: "See your county",
    line: "Open the statewide organizing intelligence rollup, then drop into your county workbench. The gold-sample dashboard shows what “full command” looks like when a county publishes.",
    chapterHref: "/organizing-intelligence",
    chapterLabel: "State organizing intelligence",
    href: "/counties",
    hrefLabel: "County workbench",
  },
  {
    key: "community",
    title: "Bring this to your community",
    line: "Host, knock doors, represent at local events, or plug in online—pick a lane that fits your life and we’ll route you to the right next step.",
    chapterHref: getInvolvedPathwaysHref,
    chapterLabel: "Volunteer & get involved",
    href: countyDashboardSampleHref,
    hrefLabel: "View sample county dashboard",
    beatId: "beat-act",
  },
];

export function HomePathwayGateway() {
  const { scrollToBeat } = useJourney();

  return (
    <div className="relative border-b border-kelly-ink/10 bg-gradient-to-b from-kelly-fog via-white to-white py-8 lg:py-10">
      <div className="mx-auto max-w-content px-[var(--gutter-x)]">
        <h2 className="mb-6 text-center font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-blue">
          Choose a pathway
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {PATHWAYS.map((p) => (
            <div
              key={p.key}
              className={cn(
                "group flex flex-col rounded-card border border-kelly-ink/10 bg-white/90 p-6 shadow-sm backdrop-blur-sm",
                "transition duration-300 hover:border-kelly-gold/45 hover:shadow-xl md:p-7",
              )}
            >
              <h3 className="font-heading text-xl font-bold text-kelly-ink group-hover:text-kelly-blue">{p.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate/95 md:text-[0.9375rem]">{p.line}</p>
              <div className="mt-6 flex flex-col gap-1 border-t border-kelly-ink/8 pt-5">
                <Link
                  href={p.chapterHref}
                  className={cn(
                    focusRing,
                    "rounded-md py-3 text-left font-body text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:text-kelly-blue sm:py-2",
                  )}
                >
                  {p.chapterLabel} →
                </Link>
                {p.beatId ? (
                  <button
                    type="button"
                    onClick={() => scrollToBeat(p.beatId!)}
                    className={cn(
                      focusRing,
                      "rounded-md py-3 text-left font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:text-kelly-blue hover:underline sm:py-2",
                    )}
                  >
                    Jump to more ways to help →
                  </button>
                ) : null}
                <Link
                  href={p.href}
                  className={cn(
                    focusRing,
                    "rounded-md py-3 font-body text-sm font-semibold text-kelly-navy underline underline-offset-4 hover:text-kelly-blue sm:py-2",
                  )}
                >
                  {p.hrefLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
