"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OPERATORS_SUBNAV = [
  { href: "/election-plan/operators", label: "Hub", exact: true },
  { href: "/election-plan/operators/my-work", label: "My work" },
  { href: "/election-plan/operators/volunteer-intake", label: "Volunteer intake" },
  { href: "/election-plan/operators/comms-command", label: "Comms command" },
  { href: "/election-plan/operators/voter-registration", label: "Voter registration" },
  { href: "/election-plan/operators/events-command", label: "Events & Mobilize" },
  { href: "/election-plan/operators/coalition-command", label: "Coalition" },
  { href: "/election-plan/operators/leader-dashboard", label: "Leader dashboard" },
  { href: "/election-plan/operators/leaders/command", label: "Leader command" },
  { href: "/election-plan/operators/lane-coverage", label: "Lane coverage" },
  { href: "/election-plan/operators/grassroots-fundraising-settlement", label: "Grassroots settlement" },
  { href: "/election-plan/operators/leaders", label: "Leader workbenches" },
  { href: "/election-plan/operators/leaders/me", label: "My workbench" },
  { href: "/election-plan/operators/field", label: "Field operators" },
] as const;

export function ElectionPlanOperatorsSubnav() {
  const pathname = usePathname() ?? "/election-plan/operators";

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-[var(--ep-navy)]/10 pb-4" aria-label="Operators sections">
      {OPERATORS_SUBNAV.map((item) => {
        const base = item.href.replace(/\/$/, "");
        const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
        const active =
          "exact" in item && item.exact ? path === base : path === base || path.startsWith(`${base}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition"
            style={{
              background: active ? "var(--ep-navy)" : "var(--ep-cream)",
              color: active ? "white" : "var(--ep-navy-muted)",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
