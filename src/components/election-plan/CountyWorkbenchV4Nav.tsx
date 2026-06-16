import { getCountyV4NavSections } from "@/lib/election-plan/county-workbench/load-county-v4-framework";

export function CountyWorkbenchV4Nav() {
  const sections = getCountyV4NavSections();
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--ep-border)] pb-4">
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
