import { COUNTY_INTELLIGENCE_NAV_SECTIONS } from "@/lib/election-plan/county-intelligence-nav";

export function CountyIntelligenceNav() {
  return (
    <nav
      aria-label="County intelligence sections"
      className="sticky top-0 z-10 mb-8 flex flex-wrap gap-2 border-b border-[var(--ep-border)] bg-[var(--ep-page)]/95 py-3 backdrop-blur-sm"
    >
      {COUNTY_INTELLIGENCE_NAV_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
