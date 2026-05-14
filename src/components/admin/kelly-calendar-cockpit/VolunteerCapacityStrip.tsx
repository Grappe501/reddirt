import Link from "next/link";

import type { VolunteerCapacityModelFile } from "@/lib/field-ops/volunteer-capacity-types";

export function VolunteerCapacityStrip({ model }: { model: VolunteerCapacityModelFile | null }) {
  if (!model) {
    return (
      <div className="rounded-lg border border-violet-300/60 bg-violet-950/10 px-3 py-2 font-body text-[11px] text-kelly-text/80">
        <span className="font-semibold text-kelly-text">Volunteer capacity model:</span> file not found. Run{" "}
        <code className="rounded bg-white/80 px-1">npm run fieldops:volunteer-capacity:build</code> in RedDirt, then reload.{" "}
        <Link className="font-semibold underline underline-offset-2" href="/admin/calendar-command-center/field-ops">
          Field ops board
        </Link>
      </div>
    );
  }
  const s = model.counties.reduce(
    (acc, c) => {
      acc.eventStaff += c.eventStaffingNeed;
      acc.hosts += c.housePartyHostNeed;
      acc.follow += c.followUpVolunteerNeed;
      if (c.localGuideNeed > 0) acc.countiesNeedGuides += 1;
      acc.guideSlots += c.localGuideNeed;
      if (c.hispanicCommunityAccessNeed === "needs_bilingual_materials" || c.hispanicCommunityAccessNeed === "needs_local_partner")
        acc.access += 1;
      return acc;
    },
    { eventStaff: 0, hosts: 0, follow: 0, countiesNeedGuides: 0, guideSlots: 0, access: 0 },
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-200/80 bg-violet-50/50 px-3 py-2 font-body text-[11px] text-kelly-text/85">
      <div>
        <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-violet-900/70">Volunteer & community coverage</span>
        <p className="mt-0.5 text-kelly-text/75">
          Event staffing slots {s.eventStaff.toLocaleString()} · house-party host need {s.hosts.toLocaleString()} · follow-up volunteer need{" "}
          {s.follow.toLocaleString()} · {s.countiesNeedGuides} counties with guide gap ({s.guideSlots} slots) · access/partner attention {s.access}{" "}
          counties
        </p>
      </div>
      <Link
        className="shrink-0 rounded-full border border-violet-300 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-violet-950 hover:bg-violet-50"
        href="/admin/calendar-command-center/field-ops"
      >
        Field ops
      </Link>
    </div>
  );
}
