"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { getOperatorsDashboardLeaders } from "@/lib/volunteers/leader-roster";
import { OperatorsLeaderJumpSelect } from "@/components/election-plan/OperatorsLeaderJumpSelect";

const OPERATORS_COMMAND_SUBNAV = [
  { href: "/election-plan/operators", label: "Hub", exact: true },
  { href: "/election-plan/operators/my-work", label: "My work" },
  { href: "/election-plan/operators/projects", label: "Projects" },
  { href: "/election-plan/operators/volunteer-intake", label: "Volunteer intake" },
  { href: "/election-plan/operators/comms-command", label: "Comms command" },
  { href: "/election-plan/operators/voter-registration", label: "Voter registration" },
  { href: "/election-plan/operators/events-command", label: "Events & Mobilize" },
  { href: "/election-plan/operators/coalition-command", label: "Coalition" },
  { href: "/election-plan/operators/leader-dashboard", label: "Leader dashboard" },
  { href: "/election-plan/operators/leaders/command", label: "Leader command" },
  { href: "/election-plan/operators/lane-coverage", label: "Lane coverage" },
  { href: "/election-plan/operators/grassroots-fundraising-settlement", label: "Grassroots settlement" },
  { href: "/election-plan/operators/leaders", label: "All workbenches" },
  { href: "/election-plan/operators/leaders/me", label: "My workbench" },
  { href: "/election-plan/operators/field", label: "Field operators" },
] as const;

function navLinkClass(active: boolean) {
  return "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition";
}

function navLinkStyle(active: boolean) {
  return {
    background: active ? "var(--ep-navy)" : "var(--ep-cream)",
    color: active ? "white" : "var(--ep-navy-muted)",
  } as const;
}

export function ElectionPlanOperatorsSubnav() {
  const pathname = usePathname() ?? "/election-plan/operators";
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  const dashboardLeaders = useMemo(() => getOperatorsDashboardLeaders(), []);

  return (
    <nav className="mb-6 border-b border-[var(--ep-navy)]/10 pb-4" aria-label="Operators sections">
      <OperatorsLeaderJumpSelect className="mb-4 max-w-md" />
      <div className="flex flex-wrap gap-2">
        {OPERATORS_COMMAND_SUBNAV.map((item) => {
          const base = item.href.replace(/\/$/, "");
          const active =
            "exact" in item && item.exact ? path === base : path === base || path.startsWith(`${base}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(active)}
              style={navLinkStyle(active)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[var(--ep-navy)]/10 pt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Leader dashboards ({dashboardLeaders.length})
        </p>
        <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
          {dashboardLeaders.map((leader) => {
            const active = path === leader.href || path.startsWith(`${leader.href}/`);
            return (
              <Link
                key={leader.slug}
                href={leader.href}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                    : "border-[var(--ep-navy)]/15 bg-white text-[var(--ep-navy)] hover:border-[var(--ep-gold)] hover:bg-[var(--ep-cream)]"
                }`}
                title={leader.workbenchTier ? `${leader.displayName} · ${leader.workbenchTier}` : leader.displayName}
              >
                <span className="max-w-[10rem] truncate normal-case">{leader.displayName}</span>
                <span
                  className={`font-mono text-[10px] font-bold tracking-wide ${
                    active ? "text-[var(--ep-gold-soft)]" : "text-[var(--ep-blue)]"
                  }${leader.workbenchTier ? "" : " opacity-80"}`}
                >
                  {leader.initials}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
