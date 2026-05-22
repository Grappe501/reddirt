import Link from "next/link";
import { notFound } from "next/navigation";
import { CockpitEventActions } from "@/components/admin/kelly-calendar-cockpit/CockpitEventActions";
import { EventSuccessPlaybookPanel } from "@/components/admin/field-ops/EventSuccessPlaybookPanel";
import { findKellyConfirmedCalendarSource, findKellyTentativeCalendarSource } from "@/lib/calendar/kelly-google-calendar-policy";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";
import { loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
import { loadEventCoveragePlans } from "@/lib/calendar/load-event-coverage-plans";
import { loadEventStaffingPlansFile, loadEventVolunteerCalloutsFile, loadEventVolunteerRemindersFile } from "@/lib/calendar/load-event-staffing-data";
import { countyVaultCountyRel, countyVaultEventRel } from "@/lib/kelly-agent/county-vault-paths";
import { buildEventSuccessPlaybook } from "@/lib/kelly-agent/tools/event-success-playbook-tool";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CalendarCommandCenterEventPage({ params }: Props) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const items = loadTravelCalendarItems();
  const bundle = await loadKellyCockpitBundle();
  const fromTravel = items.find((x) => x.id === decoded);
  const enriched = bundle.enriched.find((x) => x.id === decoded);
  const item = fromTravel ?? enriched;
  if (!item) notFound();

  const [tentativeSrc, confirmedSrc] = await Promise.all([
    findKellyTentativeCalendarSource(),
    findKellyConfirmedCalendarSource(),
  ]);

  const dd = item.drillDown;
  const vaultCountyRel = item.county ? countyVaultCountyRel(item.county) : null;
  const vaultEventRel = item.county ? countyVaultEventRel(item.county, item.title, item.start) : null;
  const eventSuccessPlaybook = buildEventSuccessPlaybook(item);
  const coveragePlan = loadEventCoveragePlans().find((p) => p.campaignEventId === decoded || p.calendarItemId === decoded || p.calendarItemId === dd?.matchedDb?.id || p.campaignEventId === dd?.matchedDb?.id);
  const eventKey = coveragePlan?.campaignEventId ?? dd?.matchedDb?.id ?? decoded;
  const staffingPlan = (loadEventStaffingPlansFile()?.plans ?? []).find((p) => p.campaignEventId === eventKey);
  const staffAssignments = staffingPlan?.assignedVolunteers ?? [];
  const callout = (loadEventVolunteerCalloutsFile()?.callouts ?? []).find((c) => c.campaignEventId === eventKey);
  const reminders = (loadEventVolunteerRemindersFile()?.reminders ?? []).filter((r) => r.campaignEventId === eventKey);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="font-body text-xs text-kelly-muted">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/kelly" className="text-kelly-text underline-offset-2 hover:underline">
          Kelly cockpit
        </Link>
        {" · "}
        <Link href="/admin/workbench/calendar" className="text-kelly-text underline-offset-2 hover:underline">
          Calendar HQ
        </Link>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-6 py-6 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          Event drill-down (staging data)
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">{item.title}</h1>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          {item.allDay
            ? `All day · ${new Date(item.start).toLocaleDateString("en-US", { timeZone: "America/Chicago", weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
            : `${new Date(item.start).toLocaleString("en-US", { timeZone: "America/Chicago" })} — ${item.end ? new Date(item.end).toLocaleString("en-US", { timeZone: "America/Chicago" }) : ""}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {enriched ? (
            <span className="rounded border border-kelly-text/25 bg-white px-2 py-1 font-body text-[10px] font-semibold text-kelly-text/80">
              Kelly: {enriched.kellyApprovalState.replace(/_/g, " ")}
            </span>
          ) : null}
          <span className="rounded bg-kelly-text px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-page">
            {item.calendarStatus}
          </span>
          <span className="rounded border border-kelly-text/20 bg-white px-2 py-1 font-body text-[10px] font-semibold text-kelly-text/80">
            {item.eventType.replace(/_/g, " ")}
          </span>
          <span className="rounded border border-kelly-text/20 bg-white px-2 py-1 font-body text-[10px] font-semibold text-kelly-text/80">
            Source: {item.source.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      {vaultCountyRel ? (
        <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">County vault</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Repo-relative paths (clone on disk). Large media stays out of git — use metadata + object storage later.
          </p>
          <dl className="mt-3 space-y-2 text-xs">
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-subtle">County folder</dt>
              <dd>
                <code className="break-all rounded bg-kelly-wash/80 px-1 py-0.5">{vaultCountyRel}</code>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Event folder (slug)</dt>
              <dd>
                <code className="break-all rounded bg-kelly-wash/80 px-1 py-0.5">{vaultEventRel}</code>
              </dd>
            </div>
          </dl>
          <ul className="mt-3 list-inside list-disc text-[11px] text-kelly-muted">
            <li>Speech notes, press notes, follow-up: add markdown under the event folder.</li>
            <li>Photo/video uploads: wire to storage in a later slice (no binaries in git).</li>
            <li>People met: use <code className="rounded bg-kelly-wash/80 px-1">people-met.json</code> when ready.</li>
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Logistics</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">County</dt>
            <dd>{item.county ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Location</dt>
            <dd className="break-words">{item.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">County touch</dt>
            <dd>{item.countyTouchCounts ? "Counts toward county touch (per workbook rules)" : "Does not count"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Verification</dt>
            <dd>Confidence {Math.round(item.verificationConfidence * 100)}%</dd>
          </div>
          {item.priorityTier ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Priority tier</dt>
              <dd>{item.priorityTier}</dd>
            </div>
          ) : null}
          {item.overnightRequired ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Overnight</dt>
              <dd>{item.overnightCity ?? "Yes (see notes)"}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Roles & contacts</h2>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Kelly&apos;s role</dt>
            <dd>{dd?.kellyRole ?? "— (fill when promoting to CampaignEvent)"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Host</dt>
            <dd>{dd?.host ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Contacts</dt>
            <dd>{dd?.contacts ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Spreadsheet context</dt>
            <dd>
              {dd?.spreadsheetTab ?? "—"}
              {dd?.rowHint ? ` · ${dd.rowHint}` : ""}
            </dd>
          </div>
          {dd?.matchedDb ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-subtle">DB link</dt>
              <dd>
                {dd.matchedDb.kind} <code className="text-xs">{dd.matchedDb.id}</code>
                {dd.matchedDb.matchReason ? ` — ${dd.matchedDb.matchReason}` : ""}
                {dd.matchedDb.kind === "CampaignEvent" ? (
                  <>
                    {" "}
                    <Link
                      href={`/admin/workbench/calendar?event=${encodeURIComponent(dd.matchedDb.id)}`}
                      className="font-semibold text-kelly-text underline-offset-2 hover:underline"
                    >
                      Open in Calendar HQ
                    </Link>
                  </>
                ) : null}
                {dd.matchedDb.kind === "WorkflowIntake" ? (
                  <>
                    {" "}
                    <Link
                      href="/admin/workbench/calendar/requests"
                      className="font-semibold text-kelly-text underline-offset-2 hover:underline"
                    >
                      Open calendar requests (intake {dd.matchedDb.id})
                    </Link>
                  </>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <EventSuccessPlaybookPanel playbook={eventSuccessPlaybook} />

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Coverage plan</h2>
        {coveragePlan ? (
          <div className="mt-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><span className="font-semibold">Candidate:</span> {coveragePlan.candidatePlan.status.replace(/_/g, " ")}</p>
              <p><span className="font-semibold">Campaign coverage:</span> {coveragePlan.coverageMode.replace(/_/g, " ")}</p>
              <p><span className="font-semibold">Volunteers needed:</span> {coveragePlan.volunteersNeeded}</p>
              <p><span className="font-semibold">Table:</span> {coveragePlan.tableNeeded ? coveragePlan.tableStatus.replace(/_/g, " ") : "not needed"}</p>
            </div>
            <p className="text-xs text-kelly-muted">{coveragePlan.notes}</p>
          </div>
        ) : (
          <p className="mt-2 text-kelly-muted">No staged coverage plan found. Run <code>npm run calendar:coverage:build</code>.</p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Event staffing</h2>
        {staffingPlan ? (
          <div className="mt-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <p><span className="font-semibold">Status:</span> {staffingPlan.status.replace(/_/g, " ")}</p>
              <p><span className="font-semibold">Confirmed:</span> {staffingPlan.volunteersConfirmed}/{staffingPlan.volunteersNeeded}</p>
              <p><span className="font-semibold">Gap:</span> {staffingPlan.staffingGap}</p>
            </div>
            <p className="text-xs text-kelly-muted">Wear: {staffingPlan.whatToWear.join(", ")} · Bring: {staffingPlan.whatToBring.join(", ")}</p>
            <ul className="space-y-2">
              {staffAssignments.map((a) => (
                <li key={a.id} className="rounded border border-kelly-text/10 bg-kelly-page/60 px-3 py-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold">{a.role.replace(/_/g, " ")}</span>
                    <span className="text-xs text-kelly-muted">{a.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-kelly-muted">{a.name ?? "Unassigned"}{a.arrivalTime ? ` · arrive ${a.arrivalTime}` : ""}</p>
                  {a.notes ? <p className="mt-1 text-xs text-kelly-muted">{a.notes}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-kelly-muted">No staged staffing roster yet. Run <code>npm run calendar:staffing:build</code>.</p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Volunteer callout draft</h2>
        {callout ? (
          <div className="mt-3 space-y-2">
            <p><span className="font-semibold">Status:</span> {callout.status.replace(/_/g, " ")}</p>
            <p><span className="font-semibold">Audience:</span> {callout.suggestedAudience.replace(/_/g, " ")} · radius {callout.suggestedRadiusMiles} miles · {callout.volunteersNeeded} needed</p>
            <p><span className="font-semibold">Roles:</span> {callout.rolesNeeded.map((r) => r.replace(/_/g, " ")).join(", ") || "—"}</p>
            <pre className="max-h-48 overflow-auto rounded border border-kelly-text/10 bg-kelly-page/70 p-2 text-[11px] whitespace-pre-wrap">{callout.draftSubject ? `Subject: ${callout.draftSubject}\n\n` : ""}{callout.draftBody ?? ""}</pre>
            <p className="text-xs font-semibold text-amber-900">Human approval required. SMS disabled. No send happens here.</p>
          </div>
        ) : (
          <p className="mt-2 text-kelly-muted">No volunteer callout needed or no staged callout yet.</p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Reminder schedule</h2>
        {reminders.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {reminders.slice(0, 12).map((r) => (
              <li key={r.id} className="rounded border border-kelly-text/10 bg-kelly-page/60 px-3 py-2">
                <p className="font-semibold">{r.timing.replace(/_/g, " ")}</p>
                <p className="text-xs text-kelly-muted">{r.status.replace(/_/g, " ")} · {r.channel}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-kelly-muted">No reminder drafts staged yet.</p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Materials pack list & staff tasks</h2>
        {coveragePlan ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ul className="list-inside list-disc text-xs">
              <li>{coveragePlan.materials.pushCards} push cards</li>
              <li>{coveragePlan.materials.fans} fans</li>
              <li>{coveragePlan.materials.brandedMints} branded mints</li>
              <li>{coveragePlan.materials.fourFootTablecloths} 4 ft tablecloths</li>
              <li>{coveragePlan.materials.pullUpBanners} pull-up banners</li>
              <li>{coveragePlan.materials.signupSheets ?? 0} signup sheets</li>
              <li>{coveragePlan.materials.clipboards ?? 0} clipboards · {coveragePlan.materials.pens ?? 0} pens</li>
              <li>{coveragePlan.materials.qrCodeCards ?? 0} QR code cards</li>
              <li>{coveragePlan.materials.yardSigns ?? 0} yard signs</li>
              <li>{coveragePlan.materials.voterRegistrationForms ?? 0} voter registration forms, only where appropriate/allowed</li>
            </ul>
            <ul className="list-inside list-disc text-xs">
              {coveragePlan.staffNextActions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      {dd?.adminLocalGuide?.displayName ? (
        <section className="rounded-lg border border-amber-300/70 bg-amber-50 px-6 py-5 font-body text-sm text-amber-950">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-amber-900/80">Local guide (admin only)</h2>
          <p className="mt-2 font-semibold">{dd.adminLocalGuide.displayName}</p>
          {dd.adminLocalGuide.notes ? <p className="mt-1 text-xs text-amber-900/85">{dd.adminLocalGuide.notes}</p> : null}
          {dd.adminLocalGuide.phone ? (
            <p className="mt-3">
              <a
                href={`tel:${dd.adminLocalGuide.phone.replace(/\s/g, "")}`}
                className="inline-flex rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-amber-800"
              >
                Tap to call
              </a>
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-amber-900/70">Not for public or donor-facing pages.</p>
        </section>
      ) : null}

      {item.notes ? (
        <section className="rounded-lg border border-kelly-text/12 bg-kelly-wash/50 px-6 py-5 font-body text-sm leading-relaxed text-kelly-text/85">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-muted">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap">{item.notes}</p>
        </section>
      ) : null}

      <CockpitEventActions
        calendarItemId={decoded}
        kellyGoogle={enriched?.kellyGoogle}
        laneMeta={{
          tentativeSourceId: tentativeSrc?.id ?? null,
          confirmedSourceId: confirmedSrc?.id ?? null,
        }}
      />
    </div>
  );
}
