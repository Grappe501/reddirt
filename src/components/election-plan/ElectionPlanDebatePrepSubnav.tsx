"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { EP_DEBATE_PREP_HREF, EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";

const tabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Command course" },
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
] as const;

export function ElectionPlanDebatePrepSubnav() {
  const path = (usePathname() ?? EP_DEBATE_PREP_HREF).split("?")[0] ?? EP_DEBATE_PREP_HREF;

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--ep-border)] pb-3" aria-label="Debate prep sections">
      {tabs.map((tab) => {
        const active = path === tab.href || (tab.href !== EP_DEBATE_PREP_HREF && path.startsWith(tab.href));
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
