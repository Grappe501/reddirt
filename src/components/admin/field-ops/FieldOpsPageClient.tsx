"use client";

import { useEffect, useMemo, useState } from "react";

import type { CountyVolunteerCapacityRow } from "@/lib/field-ops/volunteer-capacity-types";
import type { VolunteerCapacityModelFile } from "@/lib/field-ops/volunteer-capacity-types";

const TABS = [
  { id: "volunteer", label: "Volunteer capacity" },
  { id: "house-parties", label: "House parties" },
  { id: "local-guides", label: "Local guides" },
  { id: "community-access", label: "Community access" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "fundraising-support", label: "Fundraising support" },
  { id: "needs-data", label: "Needs data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function filterRows(tab: TabId, rows: CountyVolunteerCapacityRow[]): CountyVolunteerCapacityRow[] {
  const copy = [...rows];
  switch (tab) {
    case "volunteer":
      return copy.sort((a, b) => b.followUpVolunteerNeed + b.eventStaffingNeed - (a.followUpVolunteerNeed + a.eventStaffingNeed));
    case "house-parties":
      return copy.sort((a, b) => b.housePartyHostNeed - a.housePartyHostNeed);
    case "local-guides":
      return copy.filter((c) => c.localGuideNeed > 0).sort((a, b) => b.localGuideNeed - a.localGuideNeed);
    case "community-access":
      return copy
        .filter(
          (c) =>
            c.hispanicCommunityAccessNeed !== "none_known" ||
            (c.campusYouthAccessNeed && c.campusYouthAccessNeed !== "none_known") ||
            (c.seniorCommunityAccessNeed && c.seniorCommunityAccessNeed !== "none_known"),
        )
        .sort((a, b) => b.voterRegistrationEducationNeed - a.voterRegistrationEducationNeed);
    case "follow-ups":
      return copy.sort((a, b) => b.followUpVolunteerNeed - a.followUpVolunteerNeed);
    case "fundraising-support":
      return copy.sort((a, b) => (b.realisticCountyFundraisingGoal ?? 0) - (a.realisticCountyFundraisingGoal ?? 0));
    case "needs-data":
      return copy.filter((c) => c.missingData.length > 0).sort((a, b) => b.missingData.length - a.missingData.length);
    default:
      return copy;
  }
}

export function FieldOpsPageClient({
  model,
  initialTab,
}: {
  model: VolunteerCapacityModelFile | null;
  initialTab?: string;
}) {
  const [active, setActive] = useState<TabId>(() => (TABS.some((x) => x.id === initialTab) ? (initialTab as TabId) : "volunteer"));

  useEffect(() => {
    const t = (TABS.some((x) => x.id === initialTab) ? initialTab : "volunteer") as TabId;
    setActive(t);
  }, [initialTab]);

  const rows = useMemo(() => (model ? filterRows(active, model.counties) : []), [model, active]);

  if (!model) {
    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 px-4 py-4 font-body text-sm text-amber-950">
        <p className="font-semibold">No volunteer capacity model on disk.</p>
        <p className="mt-2">
          From the <code className="rounded bg-white px-1">RedDirt/</code> folder run{" "}
          <code className="rounded bg-white px-1">npm run election:targets:build</code> (win targets) then{" "}
          <code className="rounded bg-white px-1">npm run fieldops:volunteer-capacity:build</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-kelly-text/12 bg-[#f7f2e8] px-4 py-3 font-body text-xs text-kelly-text/80">
        <p>
          <span className="font-semibold text-kelly-text">Operations only</span> — coverage, logistics, accessibility for public
          engagement, and volunteer workload. Not automated voter targeting or persuasion scoring. Assumptions below are editable planning defaults.
        </p>
        <pre className="mt-2 max-h-32 overflow-auto rounded border border-kelly-text/10 bg-white/90 p-2 text-[10px] text-kelly-text/70">
          {JSON.stringify(model.assumptions, null, 2)}
        </pre>
      </div>

      {model.warnings.length ? (
        <ul className="list-inside list-disc rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 font-body text-xs text-amber-950">
          {model.warnings.map((w) => (
            <li key={w.slice(0, 80)}>{w}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-1 border-b border-kelly-text/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase ${
              active === t.id ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:bg-kelly-wash"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white shadow-sm">
        <table className="min-w-[960px] w-full border-collapse font-body text-[11px] text-kelly-text">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-wash/50 text-left text-[9px] font-bold uppercase tracking-wide text-kelly-text/55">
              <th className="px-2 py-2">County</th>
              <th className="px-2 py-2">Event staff</th>
              <th className="px-2 py-2">Hosts</th>
              <th className="px-2 py-2">Guides</th>
              <th className="px-2 py-2">Follow-up</th>
              <th className="px-2 py-2">Reg ed</th>
              <th className="px-2 py-2">Phone h</th>
              <th className="px-2 py-2">Cards est.</th>
              <th className="px-2 py-2">Access</th>
              <th className="px-2 py-2">Fund goal</th>
              <th className="px-2 py-2">Conf.</th>
              <th className="px-2 py-2">Staff next</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.county} className="border-b border-kelly-text/5 odd:bg-white even:bg-kelly-wash/30">
                <td className="px-2 py-2 font-semibold">{c.county}</td>
                <td className="px-2 py-2 tabular-nums">{c.eventStaffingNeed}</td>
                <td className="px-2 py-2 tabular-nums">{c.housePartyHostNeed}</td>
                <td className="px-2 py-2 tabular-nums">{c.localGuideNeed}</td>
                <td className="px-2 py-2 tabular-nums">{c.followUpVolunteerNeed}</td>
                <td className="px-2 py-2 tabular-nums">{c.voterRegistrationEducationNeed}</td>
                <td className="px-2 py-2 tabular-nums">{c.phoneBankCapacityNeedHours}</td>
                <td className="px-2 py-2 tabular-nums">{c.postcardCapacityNeedEstimate}</td>
                <td className="px-2 py-2 text-[10px]">{c.hispanicCommunityAccessNeed.replace(/_/g, " ")}</td>
                <td className="px-2 py-2 tabular-nums">{c.realisticCountyFundraisingGoal?.toLocaleString() ?? "—"}</td>
                <td className="px-2 py-2">{c.confidence}</td>
                <td className="max-w-[280px] px-2 py-2 text-[10px] text-kelly-text/75">
                  {c.staffNextActions.slice(0, 2).join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-body text-[10px] text-kelly-text/55">
        Reference: <code className="rounded bg-kelly-wash px-1">docs/field-ops/VOLUNTEER_CAPACITY_MODEL_V1.md</code>
      </p>
    </div>
  );
}
