import Link from "next/link";

import type { LeaderResidenceDrillDown } from "@/lib/volunteers/resolve-leader-residence";

type Props = {
  residence: LeaderResidenceDrillDown;
  leaderDisplayName: string;
  compact?: boolean;
};

export function LeaderGeographyDrillDownPanel({ residence, leaderDisplayName, compact = false }: Props) {
  const { links, cityLabel, countyName, source, confirmed } = residence;

  if (source === "missing") {
    return (
      <div className="rounded-xl border border-dashed border-amber-300/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">City & county not assigned yet</p>
        <p className="mt-1 text-xs leading-relaxed">
          HQ is confirming where {leaderDisplayName} lives. Once assigned, county playbook and city brief links appear
          here automatically.
        </p>
      </div>
    );
  }

  const cards = [
    links.countyPlaybook && countyName
      ? {
          href: links.countyPlaybook,
          title: `${countyName} County playbook`,
          subtitle: "County intelligence · strategy · field · leadership",
          accent: "county" as const,
        }
      : null,
    links.cityBrief && cityLabel
      ? {
          href: links.cityBrief,
          title: `${cityLabel} city brief`,
          subtitle: "Location brief · local narrative · priority metrics",
          accent: "city" as const,
        }
      : null,
    links.cityWorkbench && cityLabel
      ? {
          href: links.cityWorkbench,
          title: `${cityLabel} community workbench`,
          subtitle: "Events · leadership · local operator tools",
          accent: "workbench" as const,
        }
      : null,
    links.countyPathToVictory && countyName
      ? {
          href: links.countyPathToVictory,
          title: `${countyName} path to victory`,
          subtitle: "Electoral math · turnout · county targets",
          accent: "ptv" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    title: string;
    subtitle: string;
    accent: "county" | "city" | "workbench" | "ptv";
  }>;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-full border border-[var(--ep-navy)]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-blue)] transition hover:border-[var(--ep-gold)]"
          >
            {card.title} →
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--ep-gold)]/45 bg-[var(--ep-cream)]/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Where you organize</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">
            {[cityLabel, countyName ? `${countyName} County` : null].filter(Boolean).join(" · ") ||
              `${countyName} County`}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            confirmed ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
          }`}
        >
          {confirmed ? "Confirmed" : source === "inferred" ? "Inferred — confirm with HQ" : "Assigned"}
        </span>
      </div>

      {source === "inferred" && !confirmed ? (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Links below come from role connections until residence is confirmed for {leaderDisplayName}.
        </p>
      ) : null}

      <ul className={`mt-4 grid gap-3 ${cards.length > 2 ? "sm:grid-cols-2" : ""}`}>
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="block h-full rounded-lg border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm transition hover:border-[var(--ep-gold)] hover:shadow-md"
            >
              <p className="font-semibold text-[var(--ep-navy)]">{card.title}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{card.subtitle}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--ep-blue)]">Open drill-down →</p>
            </Link>
          </li>
        ))}
      </ul>

      {!links.cityBrief && countyName ? (
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          City brief pending — tell HQ which city {leaderDisplayName} lives in to unlock the city playbook link.
        </p>
      ) : null}
    </div>
  );
}
