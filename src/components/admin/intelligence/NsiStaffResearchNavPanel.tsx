import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { NSI_STAFF_RESEARCH_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";

const chip =
  "rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-kelly-navy transition hover:border-kelly-navy/40";

/** Quick entry to Tier-1 NSI staff research routes from command surfaces. */
export function NsiStaffResearchNavPanel({ compact }: { compact?: boolean }) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Staff research suite (NSI)</p>
      {!compact ? (
        <p className="mt-1 max-w-3xl text-xs text-kelly-muted">
          Morning brief through intelligence graph — headset staff and research leads. Not Kelly&apos;s debate-night
          path; verify claims before any public use.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {NSI_STAFF_RESEARCH_NAV_ITEMS.map((item) => (
          <IntelligenceNavLink key={item.href} href={item.href} title={item.description} variant="chip" className={chip}>
            {item.label}
          </IntelligenceNavLink>
        ))}
      </div>
    </section>
  );
}
