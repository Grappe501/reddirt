"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CampaignOsNavGroup } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";
import { useOperatorContext } from "./OperatorContextProvider";

export function CampaignOsNavRail({
  groups,
  badges = {},
  showCampaignOs = true,
}: {
  groups: CampaignOsNavGroup[];
  badges?: Record<string, number>;
  showCampaignOs?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const { session, toggleFocusMode } = useOperatorContext();
  const { track } = useAgentObservation();

  if (!showCampaignOs) return null;

  return (
    <div className="border-b border-[var(--border-on-navy)] pb-4">
      <div className="mb-3 flex items-center justify-between gap-2 px-3">
        <p className="os-eyebrow-inverse">Campaign OS</p>
        <button
          type="button"
          onClick={() => {
            toggleFocusMode();
            if (!session.focusMode) track("operator_focus_mode_entered", { task: "nav_rail" });
          }}
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            session.focusMode ? "bg-kelly-gold text-kelly-navy" : "border border-[var(--border-on-navy)] text-kelly-inverse-soft"
          }`}
          title="Focus mode — collapse low-priority panels"
        >
          {session.focusMode ? "Focus on" : "Focus"}
        </button>
      </div>
      <p className="px-3 pb-2 font-body text-[10px] text-kelly-inverse-muted">
        Month: <span className="font-semibold text-kelly-inverse">{session.activeMonth}</span>
      </p>
      {groups.map((group) => (
        <div key={group.id} className="mb-2">
          <p className="os-nav-group-label pb-0.5 text-[9px] tracking-[0.18em]">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const base = link.href.split("?")[0];
              const active = pathname === base || pathname.startsWith(base);
              const badge = link.badgeKey ? badges[link.badgeKey] : 0;
              return (
                <Link
                  key={`${group.id}-${link.href}`}
                  href={link.href}
                  className={`flex items-center justify-between transition ${active ? "os-nav-link-active" : "os-nav-link"}`}
                >
                  <span>{link.label}</span>
                  {badge && badge > 0 ? (
                    <span className="rounded-full bg-kelly-gold px-1.5 py-0.5 text-[10px] font-bold text-kelly-navy">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      {session.recentPaths.length > 0 ? (
        <div className="mt-3 border-t border-[var(--border-on-navy)] pt-2">
          <p className="os-nav-group-label pb-1 text-[9px] tracking-[0.18em]">Recent</p>
          {session.recentPaths.slice(0, 4).map((p) => (
            <Link key={p} href={p} className="block truncate os-nav-link py-1.5 text-xs">
              {p.replace("/admin/", "")}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
