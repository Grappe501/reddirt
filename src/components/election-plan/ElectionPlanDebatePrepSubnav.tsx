"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_DEBATE_PREP_WAR_ROOM_HREF,
  EP_TRAP_LANES_HREF,
} from "@/lib/election-plan/debate-prep-links";

const tabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Hub", exact: true },
  { href: EP_DEBATE_PREP_WAR_ROOM_HREF, label: "War room" },
  { href: EP_DEBATE_QUESTIONS_HREF, label: "40 questions" },
  { href: EP_DEBATE_PREP_COMMAND_HREF, label: "Command home" },
  { href: EP_TRAP_LANES_HREF, label: "Trap lanes" },
  { href: EP_DEBATE_TECHNIQUES_HREF, label: "Techniques" },
  { href: EP_DEBATE_PREP_TUTOR_HREF, label: "AI tutor" },
  { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal" },
  { href: EP_DEBATE_PREP_LANES_HREF, label: "Drill lanes" },
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab" },
] as const;

export function ElectionPlanDebatePrepSubnav() {
  const path = (usePathname() ?? EP_DEBATE_PREP_HREF).split("?")[0] ?? EP_DEBATE_PREP_HREF;

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--ep-border)] pb-3" aria-label="Debate prep sections">
      {tabs.map((tab) => {
        const active =
          "exact" in tab && tab.exact === true
            ? path === tab.href
            : path === tab.href || path.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              active
                ? "bg-[var(--ep-navy)] text-white"
                : "border border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)] hover:border-[var(--ep-navy)] hover:text-[var(--ep-navy)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
