import Link from "next/link";

import { parseGuideListItem, splitGuideTextWithLinks } from "@/lib/election-plan/debatePrepGuideLinks";

const BADGE_CLASS: Record<string, string> = {
  OFFENSE: "rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-900",
  DEFENSE: "rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-900",
  VERIFY: "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900",
};

export function DebatePrepGuideLinkText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { badge, body } = parseGuideListItem(text);
  const segments = splitGuideTextWithLinks(body);

  return (
    <span className={className}>
      {badge ? <span className={`mr-1.5 ${BADGE_CLASS[badge]}`}>{badge}</span> : null}
      {segments.map((seg, i) =>
        seg.kind === "link" ? (
          <Link key={`${seg.href}-${i}`} href={seg.href} className="font-semibold text-[var(--ep-navy)] underline hover:text-[var(--ep-gold)]">
            {seg.label}
          </Link>
        ) : (
          <span key={`t-${i}`}>{seg.value}</span>
        ),
      )}
    </span>
  );
}
