"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommunityOpportunity } from "@/lib/opportunities/community-opportunity-types";
import type { WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";
import { opportunityBoardStub } from "@/app/admin/calendar-command-center/opportunities-actions";
import { OpportunitiesMap } from "@/components/admin/calendar-command-center/OpportunitiesMap";

type Tab =
  | "county_fair"
  | "aea_meeting"
  | "retired_teachers"
  | "extension_homemakers"
  | "campus_event"
  | "high_school_football"
  | "weekend_routes"
  | "needs_calls"
  | "map";

const TAB_LABEL: Record<Tab, string> = {
  county_fair: "County fairs",
  aea_meeting: "Teachers / AEA",
  retired_teachers: "Retired teachers",
  extension_homemakers: "Extension Homemakers",
  campus_event: "Campuses",
  high_school_football: "Football",
  weekend_routes: "Weekend routes",
  needs_calls: "Needs calls",
  map: "Map view",
};

function rowMatchesTab(r: CommunityOpportunity, tab: Tab): boolean {
  if (tab === "needs_calls") {
    return r.verificationStatus === "needs_confirmation" || r.verificationStatus === "date_not_posted";
  }
  if (tab === "map") return true;
  return r.type === tab;
}

function IntentButtons({ opportunityId }: { opportunityId: string }) {
  const intents = [
    ["tentative", "Tentative"],
    ["verified", "Verified"],
    ["needs_call", "Needs call"],
    ["send_local", "Send local"],
    ["local_guide", "Local guide"],
    ["build_route", "Build route"],
    ["compare_routes", "Compare"],
    ["hide_kelly", "Hide"],
    ["approval_queue", "Kelly queue"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-1">
      {intents.map(([intent, label]) => (
        <form key={intent} action={opportunityBoardStub}>
          <input type="hidden" name="opportunityId" value={opportunityId} />
          <input type="hidden" name="intent" value={intent} />
          <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-1 text-[9px] font-bold uppercase text-kelly-text">
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}

export function OpportunitiesShell({
  opportunities,
  plans,
}: {
  opportunities: CommunityOpportunity[];
  plans: WeekendRoutePlan[];
}) {
  const [tab, setTab] = useState<Tab>("county_fair");
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#weekend-routes") setTab("weekend_routes");
  }, []);
  const filtered = useMemo(() => opportunities.filter((r) => rowMatchesTab(r, tab)), [opportunities, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-kelly-text/15 pb-2">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            id={t === "weekend_routes" ? "weekend-routes-tab" : undefined}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-wide ${
              tab === t ? "bg-kelly-text text-white" : "bg-kelly-wash/80 text-kelly-text/80"
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "weekend_routes" ? (
        <div id="weekend-routes" className="space-y-3">
          {plans.length === 0 ? (
            <p className="font-body text-sm text-kelly-muted">Run `npm run opportunities:plan-weekends` to generate weekend-route-plans-2026.json.</p>
          ) : (
            plans.map((p) => (
              <div key={p.id} className="rounded-lg border border-kelly-text/12 bg-white px-3 py-3 font-body text-xs text-kelly-text">
                <p className="font-heading text-sm font-bold">{p.title}</p>
                <p className="mt-1 text-kelly-text/75">
                  {p.weekStart} · drive ~{p.totalDriveMinutes}m · {p.routeTightness} · staff: {p.staffRecommendation}
                </p>
                <ul className="mt-2 list-inside list-disc text-[11px] text-kelly-muted">
                  {p.opportunities.map((s) => (
                    <li key={`${p.id}-${s.opportunityId}-${s.recommendedArrival}`}>
                      {s.day}: {s.opportunityId} · arr {s.recommendedArrival}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : tab === "map" ? (
        <OpportunitiesMap rows={opportunities.filter((r) => typeof r.lat === "number")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white">
          <table className="min-w-full border-collapse font-body text-xs text-kelly-text">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-wash/50 text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-2 py-2">County</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Verified</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 400).map((r) => (
                <tr key={r.id} className="border-b border-kelly-text/10 hover:bg-kelly-wash/30">
                  <td className="px-2 py-2 font-semibold">{r.county}</td>
                  <td className="max-w-[220px] px-2 py-2">{r.title}</td>
                  <td className="whitespace-nowrap px-2 py-2">{r.type}</td>
                  <td className="px-2 py-2">{r.verificationStatus}</td>
                  <td className="px-2 py-2">{r.score?.total ?? "—"}</td>
                  <td className="px-1 py-1">
                    <IntentButtons opportunityId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 400 ? (
            <p className="border-t border-kelly-text/10 px-2 py-2 font-body text-[10px] text-kelly-muted">
              Showing first 400 rows in this tab — narrow with filters in a later pass.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
