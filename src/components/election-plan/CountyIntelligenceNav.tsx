import { getCountyIntelligenceNavSections, type CountyIntelligenceNavSection } from "@/lib/election-plan/county-intelligence-nav";

type Props = {
  hasDbIntel?: boolean;
  hasVault?: boolean;
};

export function CountyIntelligenceNav({ hasDbIntel = false, hasVault = false }: Props) {
  const sections: CountyIntelligenceNavSection[] = getCountyIntelligenceNavSections({ hasDbIntel, hasVault });

  return (
    <nav
      aria-label="County intelligence sections"
      className="sticky top-0 z-10 mb-8 flex flex-wrap gap-2 border-b border-[var(--ep-border)] bg-[var(--ep-page)]/95 py-3 backdrop-blur-sm"
    >
      {sections.map((s) => (
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
