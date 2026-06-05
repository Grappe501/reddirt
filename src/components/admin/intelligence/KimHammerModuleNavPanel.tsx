import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { buildKimHammerTier3NavGroups } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";

const chip =
  "rounded border border-rose-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-navy transition hover:border-kelly-navy/40 whitespace-nowrap";

const card =
  "rounded-lg border border-kelly-text/10 bg-white p-3 transition hover:border-kelly-navy/30";

/** Tier-3 Kim Hammer module catalog — grouped KH-0 through KH-4. */
export function KimHammerModuleNavPanel({
  compact,
  activeHref,
}: {
  compact?: boolean;
  activeHref?: string;
}) {
  const groups = buildKimHammerTier3NavGroups();

  if (compact) {
    return (
      <section className="mb-6 rounded-xl border border-rose-200/50 bg-rose-50/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-950">Hammer research modules</p>
          <Link href={KIM_HAMMER_COMMAND_CENTER_HREF} className="text-[10px] font-bold text-kelly-navy underline">
            Full record map →
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groups.flatMap((g) => g.modules).slice(0, 12).map((mod) => (
            <IntelligenceNavLink
              key={mod.href}
              href={mod.href}
              variant="chip"
              className={`${chip} ${activeHref === mod.href ? "border-kelly-navy bg-kelly-page" : ""}`}
            >
              {mod.title}
            </IntelligenceNavLink>
          ))}
          <IntelligenceNavLink href={KIM_HAMMER_COMMAND_CENTER_HREF} variant="chip" className={chip}>
            + all modules
          </IntelligenceNavLink>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 space-y-6">
      <header className="rounded-xl border-2 border-rose-200/60 bg-gradient-to-br from-rose-50/40 to-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-950">Tier 3 · Kim Hammer research stack</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">All opponent modules — KH-0 through KH-4</h2>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          {groups.reduce((n, g) => n + g.modules.length, 0)} built modules across election record, public profile,
          debate intelligence, deep research, retrieval, and evidence governance. Kelly stays on debate prep on stage
          night; staff uses KH-3/KH-4 for retrieval and export.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <IntelligenceNavLink href="/admin/intelligence/kim-hammer/debate-prep" variant="chip" className={chip}>
            Debate prep
          </IntelligenceNavLink>
          <IntelligenceNavLink href="/admin/intelligence/opponents/dossiers/kim-hammer" variant="chip" className={chip}>
            Hammer dossier
          </IntelligenceNavLink>
          <IntelligenceNavLink href="/admin/intelligence/kim-hammer/evidence-command" variant="chip" className={chip}>
            Evidence command
          </IntelligenceNavLink>
        </div>
      </header>

      {groups.map((group) => (
        <div key={group.id} id={group.id}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{group.layer}</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{group.title}</h3>
          <p className="mt-1 max-w-3xl text-xs text-kelly-muted">{group.description}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.modules.map((mod) => (
              <IntelligenceNavLink
                key={mod.href}
                href={mod.href}
                variant="chip"
                className={`${card} block ${activeHref === mod.href ? "border-kelly-navy ring-1 ring-kelly-navy/20" : ""}`}
              >
                <p className="font-bold text-kelly-navy">{mod.title}</p>
                <p className="mt-1 text-[10px] text-kelly-muted">{mod.summary}</p>
              </IntelligenceNavLink>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}