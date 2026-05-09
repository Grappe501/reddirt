import type { StrategyOutlineItem } from "@/lib/campaign-strategy/strategy-outline";

function filterOutlineForNav(items: StrategyOutlineItem[]): StrategyOutlineItem[] {
  return items.filter((it) => it.level >= 2 && it.level <= 4);
}

function OutlineList({ items }: { items: StrategyOutlineItem[] }) {
  return (
    <ul className="mt-3 space-y-1.5 font-body text-[13px] leading-snug">
      {items.map((item, idx) => (
        <li
          key={`${item.id}-${idx}`}
          className="border-l-2 border-transparent pl-2 hover:border-kelly-gold/40"
          style={{ marginLeft: Math.max(0, (item.level - 2) * 10) }}
        >
          <a href={`#${item.id}`} className="text-kelly-blue hover:underline">
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function StrategyOnThisPage({ outline }: { outline: StrategyOutlineItem[] }) {
  const navItems = filterOutlineForNav(outline);
  if (navItems.length < 3) return null;

  return (
    <>
      <details className="mb-6 rounded-xl border border-kelly-text/10 bg-kelly-fog/30 p-4 lg:hidden print:hidden">
        <summary className="cursor-pointer select-none font-heading text-xs font-bold uppercase tracking-wide text-kelly-deep">
          On this page
        </summary>
        <div className="mt-3 max-h-[40vh] overflow-y-auto overscroll-y-contain">
          <OutlineList items={navItems} />
        </div>
      </details>

      <nav
        aria-label="On this page"
        className="sticky top-6 hidden max-h-[calc(100vh-5rem)] w-[13.75rem] shrink-0 overflow-y-auto overscroll-y-contain pb-10 print:hidden lg:block"
      >
        <p className="border-b border-kelly-text/10 pb-2 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-slate/75">
          On this page
        </p>
        <OutlineList items={navItems} />
      </nav>
    </>
  );
}
