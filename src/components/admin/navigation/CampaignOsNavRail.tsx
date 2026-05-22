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
    <div className="border-b border-kelly-page/10 pb-4">
      <div className="mb-3 flex items-center justify-between gap-2 px-3">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-page/45">
          Campaign OS
        </p>
        <button
          type="button"
          onClick={() => {
            toggleFocusMode();
            if (!session.focusMode) track("operator_focus_mode_entered", { task: "nav_rail" });
          }}
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            session.focusMode ? "bg-kelly-gold/90 text-kelly-navy" : "border border-kelly-page/25 text-kelly-page/70"
          }`}
          title="Focus mode — collapse low-priority panels"
        >
          {session.focusMode ? "Focus on" : "Focus"}
        </button>
      </div>
      <p className="px-3 pb-2 font-body text-[10px] text-kelly-page/50">
        Month: <span className="font-semibold text-kelly-page">{session.activeMonth}</span>
      </p>
      {groups.map((group) => (
        <div key={group.id} className="mb-2">
          <p className="px-3 pb-0.5 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-kelly-page/40">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href.split("?")[0] || pathname.startsWith(link.href.split("?")[0]);
              const badge = link.badgeKey ? badges[link.badgeKey] : 0;
              return (
                <Link
                  key={`${group.id}-${link.href}`}
                  href={link.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 font-body text-sm font-medium transition ${
                    active
                      ? "bg-kelly-page/15 text-kelly-page"
                      : "text-kelly-page/85 hover:bg-kelly-page/10 hover:text-kelly-page"
                  }`}
                >
                  <span>{link.label}</span>
                  {badge && badge > 0 ? (
                    <span className="rounded-full bg-kelly-gold/90 px-1.5 py-0.5 text-[10px] font-bold text-kelly-navy">
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
        <div className="mt-3 border-t border-kelly-page/10 pt-2">
          <p className="px-3 pb-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-kelly-page/40">
            Recent
          </p>
          {session.recentPaths.slice(0, 4).map((p) => (
            <Link
              key={p}
              href={p}
              className="block truncate rounded-md px-3 py-1.5 font-body text-xs text-kelly-page/70 hover:bg-kelly-page/10 hover:text-kelly-page"
            >
              {p.replace("/admin/", "")}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
