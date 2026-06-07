"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import {
  buildCandidateCommandNavSections,
  shouldUseCandidateCommandSectionNav,
} from "@/lib/intelligence/v4/candidateCommandNav";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";

const SECTION_STYLES: Record<string, { header: string; chip: string; active: string }> = {
  home: {
    header: "border-indigo-200 bg-indigo-50/80 text-indigo-950",
    chip: "border-indigo-200 bg-white text-indigo-950",
    active: "border-indigo-400 bg-indigo-100 text-indigo-950 ring-1 ring-indigo-300",
  },
  rehearse: {
    header: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
    chip: "border-emerald-200 bg-white text-emerald-950",
    active: "border-emerald-400 bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300",
  },
  philosophy: {
    header: "border-violet-200 bg-violet-50/80 text-violet-950",
    chip: "border-violet-200 bg-white text-violet-950",
    active: "border-violet-400 bg-violet-100 text-violet-950 ring-1 ring-violet-300",
  },
  opposition: {
    header: "border-amber-200 bg-amber-50/80 text-amber-950",
    chip: "border-amber-200 bg-white text-amber-950",
    active: "border-amber-400 bg-amber-100 text-amber-950 ring-1 ring-amber-300",
  },
  safety: {
    header: "border-rose-200 bg-rose-50/80 text-rose-950",
    chip: "border-rose-200 bg-white text-rose-950",
    active: "border-rose-400 bg-rose-100 text-rose-950 ring-1 ring-rose-300",
  },
  operations: {
    header: "border-violet-300 bg-violet-100/80 text-violet-950",
    chip: "border-violet-200 bg-white text-violet-950",
    active: "border-violet-500 bg-violet-100 text-violet-950 ring-1 ring-violet-400",
  },
};

const base =
  "rounded border px-2 py-1 text-xs font-semibold transition sm:px-2.5 sm:py-1.5 whitespace-nowrap";

export function CandidateCommandSectionNav() {
  const pathname = usePathname() ?? "";
  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  const sections = useMemo(() => buildCandidateCommandNavSections(profile), [profile]);
  const allHrefs = useMemo(() => sections.flatMap((s) => s.links.map((l) => ({ href: l.href }))), [sections]);
  const activeHref = resolveActiveCampaignOsNavHref(pathname, allHrefs);

  const activeSectionId =
    sections.find((sec) =>
      sec.links.some((l) => campaignOsNavHrefBase(l.href) === activeHref),
    )?.id ?? "home";

  const [openSection, setOpenSection] = useState<string | null>(activeSectionId);

  if (!shouldUseCandidateCommandSectionNav(profile)) return null;

  return (
    <nav className="mb-6 space-y-2 border-b border-kelly-text/10 bg-kelly-page/90 pb-3" aria-label="Candidate command sections">
      <p className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs leading-relaxed text-indigo-950">
        <span className="font-bold uppercase">Phase 15 · </span>
        Five orchestrated sections — builder tracks hidden. Command home is your single landing screen.
      </p>
      {sections.map((sec) => {
        const styles = SECTION_STYLES[sec.id] ?? SECTION_STYLES.home!;
        const expanded = openSection === sec.id;
        return (
          <div key={sec.id} className="rounded-lg border border-kelly-text/10 bg-white/70">
            <button
              type="button"
              onClick={() => setOpenSection(expanded ? null : sec.id)}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left ${styles.header}`}
            >
              <span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">{sec.label}</span>
                <span className="mt-0.5 block text-[11px] font-normal opacity-90">{sec.summary}</span>
              </span>
              <span className="text-[10px] font-bold">{expanded ? "−" : "+"}</span>
            </button>
            {expanded ? (
              <div className="flex flex-wrap gap-1.5 border-t border-kelly-text/10 p-2">
                {sec.links.map((link) => {
                  const basePath = campaignOsNavHrefBase(link.href);
                  const active = activeHref === basePath;
                  return (
                    <IntelligenceNavLink
                      key={link.href}
                      href={link.href}
                      title={link.description}
                      variant="chip"
                      className={`${base} ${active ? styles.active : styles.chip}`}
                    >
                      {link.label}
                    </IntelligenceNavLink>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
