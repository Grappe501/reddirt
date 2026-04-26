"use client";

import Link from "next/link";
import { useJourney } from "@/components/journey/journey-context";
import { cn } from "@/lib/utils";

type PathwayCard = {
  key: string;
  title: string;
  line: string;
  href: string;
  hrefLabel: string;
  /** In-page journey scroll (homepage) */
  beatId?: string;
  /** Full chapter on its own route */
  chapterHref?: string;
};

const PATHWAYS: PathwayCard[] = [
  {
    key: "learn",
    title: "Learn the office",
    line: "What the Secretary of State does—and why it touches every voter and county.",
    chapterHref: "/understand",
    href: "/priorities",
    hrefLabel: "Priorities hub",
  },
  {
    key: "civic",
    title: "Ballot access & democracy",
    line: "How initiatives work and why direct democracy needs a fair front office.",
    chapterHref: "/civic-depth",
    href: "/direct-democracy",
    hrefLabel: "Direct democracy",
  },
  {
    key: "field",
    title: "Follow the campaign trail",
    line: "Photos, social updates, and notes from counties across Arkansas—so you can see the work in real rooms, not just headlines.",
    chapterHref: "/from-the-road#trail-photos",
    href: "/from-the-road",
    hrefLabel: "From the Road hub",
  },
  {
    key: "act",
    title: "Find your lane",
    line: "Volunteer, donate, host, or follow—pick what fits your life.",
    beatId: "beat-act",
    href: "/get-involved",
    hrefLabel: "Get involved",
  },
];

export function HomePathwayGateway() {
  const { scrollToBeat } = useJourney();

  return (
    <div className="relative border-b border-civic-ink/10 bg-gradient-to-b from-civic-fog via-white to-white py-5 lg:py-6">
      <div className="mx-auto max-w-content px-[var(--gutter-x)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {PATHWAYS.map((p) => (
            <div
              key={p.key}
              className={cn(
                "group flex flex-col rounded-card border border-civic-ink/10 bg-white/90 p-6 shadow-sm backdrop-blur-sm",
                "transition duration-300 hover:border-civic-gold/45 hover:shadow-xl",
              )}
            >
              <h3 className="font-heading text-lg font-bold text-civic-ink group-hover:text-civic-blue">{p.title}</h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-civic-slate/95">{p.line}</p>
              <div className="mt-6 flex flex-col gap-2 border-t border-civic-ink/8 pt-5">
                {p.chapterHref ? (
                  <Link
                    href={p.chapterHref}
                    className="text-left font-body text-sm font-bold uppercase tracking-wider text-red-dirt transition hover:text-civic-blue"
                  >
                    Open this section →
                  </Link>
                ) : p.beatId ? (
                  <button
                    type="button"
                    onClick={() => scrollToBeat(p.beatId!)}
                    className="text-left font-body text-sm font-bold uppercase tracking-wider text-red-dirt transition hover:text-civic-blue"
                  >
                    Jump to ways to help →
                  </button>
                ) : null}
                <a
                  href={p.href}
                  className="font-body text-sm font-semibold text-civic-slate underline-offset-4 hover:text-civic-blue hover:underline"
                >
                  {p.hrefLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
