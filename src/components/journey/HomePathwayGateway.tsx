"use client";

import { useJourney } from "@/components/journey/journey-context";
import { cn } from "@/lib/utils";

const PATHWAYS = [
  {
    key: "learn",
    title: "Learn the office",
    line: "What the Secretary of State does—and why it touches every voter and county.",
    beatId: "beat-educate",
    href: "/priorities",
    hrefLabel: "Priorities hub",
  },
  {
    key: "civic",
    title: "Ballot access & democracy",
    line: "How initiatives work and why direct democracy needs a fair front office.",
    beatId: "beat-civic",
    href: "/direct-democracy",
    hrefLabel: "Direct democracy",
  },
  {
    key: "field",
    title: "See the field operation",
    line: "Proof, counties, and Kelly in her own words—not a brochure, a running campaign.",
    beatId: "beat-field",
    href: "/updates",
    hrefLabel: "Campaign trail",
  },
  {
    key: "act",
    title: "Find your lane",
    line: "Volunteer, donate, host, or follow—pick what fits your life.",
    beatId: "beat-act",
    href: "/get-involved",
    hrefLabel: "Get involved",
  },
] as const;

export function HomePathwayGateway() {
  const { scrollToBeat } = useJourney();

  return (
    <div className="relative border-b border-civic-ink/10 bg-gradient-to-b from-civic-fog via-white to-white py-14 lg:py-20">
      <div className="mx-auto max-w-content px-[var(--gutter-x)]">
        <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.28em] text-civic-blue">Choose your path</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-center font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-tight text-civic-ink">
          This site is built to meet you where you are
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center font-body text-lg leading-relaxed text-civic-slate">
          Scroll a guided journey, or jump ahead. Every card opens deeper pages when you’re ready—not a wall of feeds.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
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
                <button
                  type="button"
                  onClick={() => scrollToBeat(p.beatId)}
                  className="text-left font-body text-sm font-bold uppercase tracking-wider text-red-dirt transition hover:text-civic-blue"
                >
                  Continue this chapter →
                </button>
                <a
                  href={p.href}
                  className="font-body text-sm font-semibold text-civic-slate underline-offset-4 hover:text-civic-blue hover:underline"
                >
                  {p.hrefLabel} (full page)
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
