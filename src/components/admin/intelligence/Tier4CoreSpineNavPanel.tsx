import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { buildTier4CoreSpineNavGroups } from "@/lib/intelligence/v4/tier4CoreSpineNav";

const chip =
  "rounded border border-emerald-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-navy transition hover:border-kelly-navy/40 whitespace-nowrap";

const card =
  "rounded-lg border border-kelly-text/10 bg-white p-3 transition hover:border-kelly-navy/30";

/** Tier-4 core debate-week spine — primary, extended staff tools, iPad paths. */
export function Tier4CoreSpineNavPanel({
  compact,
  activeHref,
}: {
  compact?: boolean;
  activeHref?: string;
}) {
  const groups = buildTier4CoreSpineNavGroups();

  if (compact) {
    return (
      <section className="mb-6 rounded-xl border border-emerald-200/50 bg-emerald-50/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-950">Core debate-week spine</p>
          <Link href="/admin/intelligence/supreme-workbench" className="text-[10px] font-bold text-kelly-navy underline">
            Supreme workbench →
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groups[0].items.slice(0, 8).map((item) => (
            <IntelligenceNavLink
              key={item.href}
              href={item.href}
              title={item.description}
              variant="chip"
              className={`${chip} ${activeHref === item.href ? "border-kelly-navy bg-kelly-page" : ""}`}
            >
              {item.label}
            </IntelligenceNavLink>
          ))}
          <IntelligenceNavLink href="/admin/intelligence/debate-command" variant="chip" className={chip}>
            Debate command
          </IntelligenceNavLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 space-y-6">
      <header className="rounded-xl border-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-950">Tier 4 · Core operational spine</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Debate-week path — already in sidebar & iPad</h2>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Kelly&apos;s county-clerk primary path, staff extended tools, and candidate iPad tabs — plus drill-downs for
          trap lanes, SOS questions, ACCA sections, dossiers, bills, and debate prep sections.
        </p>
      </header>

      {groups.map((group) => (
        <div key={group.id} id={group.id}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{group.title}</p>
          <p className="mt-1 max-w-3xl text-xs text-kelly-muted">{group.description}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <IntelligenceNavLink
                key={item.href}
                href={item.href}
                title={item.description}
                variant="chip"
                className={`${card} ${activeHref === item.href ? "border-kelly-navy ring-1 ring-kelly-navy/20" : ""}`}
              >
                <p className="font-bold text-kelly-navy">{item.label}</p>
                <p className="mt-1 text-[10px] text-kelly-muted">{item.description}</p>
              </IntelligenceNavLink>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
