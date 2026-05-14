import Link from "next/link";
import { loadEventCoveragePlansFile } from "@/lib/calendar/load-event-coverage-plans";
import { loadEventStaffingPlansFile, loadEventVolunteerCalloutsFile, loadEventVolunteerRemindersFile } from "@/lib/calendar/load-event-staffing-data";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";

export const dynamic = "force-dynamic";

type CoverageTabId =
  | "needs-volunteer-lead"
  | "needs-callout"
  | "reminder-drafts"
  | "materials-pack-list"
  | "table-permission"
  | "fully-staffed"
  | "not-covering";

const TABS: Array<{ id: CoverageTabId; label: string; filter: (p: CampaignEventCoveragePlan) => boolean }> = [
  { id: "needs-volunteer-lead", label: "Needs volunteer lead", filter: (p) => p.volunteerLeadNeeded && !p.volunteerLeadName },
  { id: "needs-callout", label: "Needs callout", filter: (p) => p.volunteersNeeded > 0 && !["covered", "cancelled", "not_covering"].includes(p.status) },
  { id: "reminder-drafts", label: "Reminder drafts", filter: (p) => p.volunteersNeeded > 0 && !["cancelled", "not_covering"].includes(p.status) },
  { id: "materials-pack-list", label: "Materials pack list", filter: (p) => p.materials.pushCards > 0 || p.materials.fans > 0 || p.shirtsNeeded > 0 },
  { id: "table-permission", label: "Table permission", filter: (p) => p.tableNeeded && p.tableStatus === "needs_permission" },
  { id: "fully-staffed", label: "Fully staffed", filter: (p) => p.status === "ready" || p.status === "covered" },
  { id: "not-covering", label: "Not covering", filter: (p) => p.status === "not_covering" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

function badge(label: string) {
  return <span className="rounded-full border border-kelly-text/15 bg-kelly-wash px-2 py-0.5 text-[9px] font-bold uppercase text-kelly-text/70">{label}</span>;
}

export default async function CoveragePage({ searchParams }: Props) {
  const sp = await searchParams;
  const file = loadEventCoveragePlansFile();
  const staffFile = loadEventStaffingPlansFile();
  const calloutFile = loadEventVolunteerCalloutsFile();
  const reminderFile = loadEventVolunteerRemindersFile();
  const tab = TABS.find((t) => t.id === sp.tab) ?? TABS[0]!;
  const plans = file?.plans ?? [];
  const rows = plans.filter(tab.filter).slice(0, 200);
  const calloutByEvent = new Map((calloutFile?.callouts ?? []).map((c) => [c.campaignEventId, c]));
  const staffByEvent = new Map((staffFile?.plans ?? []).map((p) => [p.campaignEventId, p]));
  const remindersByEvent = new Map<string, number>();
  for (const r of reminderFile?.reminders ?? []) remindersByEvent.set(r.campaignEventId, (remindersByEvent.get(r.campaignEventId) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div className="font-body text-xs text-kelly-text/60">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">← Command center</Link>
        {" · "}
        <span>Campaign coverage</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">Staff coverage layer</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">How does the campaign cover every event?</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          This is a staff page, not a Kelly-facing flood. It turns each calendar event into a coverage plan: candidate, local volunteers,
          table/materials, monitor-only, or follow-up. No email/SMS/Google writes happen here.
        </p>
      </header>

      {!file ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          Run <code className="rounded bg-white px-1">npm run calendar:coverage:build</code> to generate staged coverage plans.
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Plans</p><p className="font-heading text-xl font-bold">{file.stats.total}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Local coverage</p><p className="font-heading text-xl font-bold">{file.stats.needsLocalCoverage}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Volunteer lead</p><p className="font-heading text-xl font-bold">{file.stats.needsVolunteerLead}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Table permission</p><p className="font-heading text-xl font-bold">{file.stats.needsTablePermission}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Push cards</p><p className="font-heading text-xl font-bold">{file.stats.materials.pushCards}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Fans / shirts</p><p className="font-heading text-xl font-bold">{file.stats.materials.fans} / {file.stats.materials.shirts}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Mints</p><p className="font-heading text-xl font-bold">{file.stats.materials.brandedMints}</p></div>
            <div className="rounded-lg border bg-white px-3 py-3"><p className="text-[10px] uppercase text-kelly-text/50">Tablecloths / banners</p><p className="font-heading text-xl font-bold">{file.stats.materials.fourFootTablecloths} / {file.stats.materials.pullUpBanners}</p></div>
          </section>

          <nav className="flex flex-wrap gap-2 border-b border-kelly-text/10 pb-2">
            {TABS.map((t) => (
              <Link key={t.id} href={`/admin/calendar-command-center/coverage?tab=${t.id}`} className={`rounded-full px-3 py-1.5 font-body text-[10px] font-bold uppercase ${t.id === tab.id ? "bg-kelly-text text-white" : "bg-kelly-wash text-kelly-text/75"}`}>
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white">
            <table className="min-w-[1100px] w-full border-collapse font-body text-[11px] text-kelly-text">
              <thead className="bg-kelly-wash/50 text-left text-[9px] uppercase tracking-wide text-kelly-text/55">
                <tr>
                  <th className="px-2 py-2">Event</th>
                  <th className="px-2 py-2">Coverage</th>
                  <th className="px-2 py-2">Volunteers</th>
                  <th className="px-2 py-2">Table</th>
                  <th className="px-2 py-2">Materials</th>
                  <th className="px-2 py-2">Next action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-kelly-text/10">
                    <td className="px-2 py-2">
                      <Link href={`/admin/calendar-command-center/event/${encodeURIComponent(p.calendarItemId ?? p.campaignEventId)}`} className="font-semibold underline-offset-2 hover:underline">
                        {p.county ?? "No county"} · {p.campaignEventId.slice(0, 8)}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.coverageMode.startsWith("kelly") ? badge("Kelly") : badge("Local coverage")}
                        {p.tableNeeded ? badge("Table needed") : null}
                        {p.volunteerLeadNeeded ? badge("Needs volunteer lead") : null}
                        {p.status === "ready" ? badge("Ready") : null}
                      </div>
                    </td>
                    <td className="px-2 py-2">{p.coverageMode.replace(/_/g, " ")}<br /><span className="text-kelly-text/55">{p.candidateDecision.replace(/_/g, " ")}</span></td>
                    <td className="px-2 py-2">
                      {p.volunteersNeeded} needed · {staffByEvent.get(p.campaignEventId)?.volunteersConfirmed ?? 0} confirmed<br />
                      gap {staffByEvent.get(p.campaignEventId)?.staffingGap ?? p.volunteersNeeded} · {p.shirtsNeeded} shirts
                    </td>
                    <td className="px-2 py-2">{p.tableNeeded ? p.tableStatus.replace(/_/g, " ") : "not needed"}</td>
                    <td className="px-2 py-2">
                      {p.materials.pushCards} cards · {p.materials.fans} fans · {p.materials.brandedMints} mints<br />
                      {p.materials.fourFootTablecloths} cloths · {p.materials.pullUpBanners} banners · {p.materials.signupSheets ?? 0} signup sheets
                    </td>
                    <td className="max-w-[340px] px-2 py-2">
                      {p.staffNextActions.slice(0, 3).join(" · ")}
                      <br />
                      <span className="text-kelly-text/55">
                        Staffing: {staffByEvent.get(p.campaignEventId)?.status?.replace(/_/g, " ") ?? "not built"} · callout: {calloutByEvent.get(p.campaignEventId)?.status ?? "—"} · reminders {remindersByEvent.get(p.campaignEventId) ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
