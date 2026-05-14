import Link from "next/link";
import { notFound } from "next/navigation";
import { CockpitEventActions } from "@/components/admin/kelly-calendar-cockpit/CockpitEventActions";
import { EventSuccessPlaybookPanel } from "@/components/admin/field-ops/EventSuccessPlaybookPanel";
import { findKellyConfirmedCalendarSource, findKellyTentativeCalendarSource } from "@/lib/calendar/kelly-google-calendar-policy";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";
import { loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="font-body text-xs text-kelly-text/60">
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
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">
          Event drill-down (staging data)
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">{item.title}</h1>
        <p className="mt-2 font-body text-sm text-kelly-text/70">
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
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">County vault</h2>
          <p className="mt-2 text-xs text-kelly-text/70">
            Repo-relative paths (clone on disk). Large media stays out of git — use metadata + object storage later.
          </p>
          <dl className="mt-3 space-y-2 text-xs">
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-text/45">County folder</dt>
              <dd>
                <code className="break-all rounded bg-kelly-wash/80 px-1 py-0.5">{vaultCountyRel}</code>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Event folder (slug)</dt>
              <dd>
                <code className="break-all rounded bg-kelly-wash/80 px-1 py-0.5">{vaultEventRel}</code>
              </dd>
            </div>
          </dl>
          <ul className="mt-3 list-inside list-disc text-[11px] text-kelly-text/70">
            <li>Speech notes, press notes, follow-up: add markdown under the event folder.</li>
            <li>Photo/video uploads: wire to storage in a later slice (no binaries in git).</li>
            <li>People met: use <code className="rounded bg-kelly-wash/80 px-1">people-met.json</code> when ready.</li>
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Logistics</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">County</dt>
            <dd>{item.county ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Location</dt>
            <dd className="break-words">{item.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">County touch</dt>
            <dd>{item.countyTouchCounts ? "Counts toward county touch (per workbook rules)" : "Does not count"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Verification</dt>
            <dd>Confidence {Math.round(item.verificationConfidence * 100)}%</dd>
          </div>
          {item.priorityTier ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Priority tier</dt>
              <dd>{item.priorityTier}</dd>
            </div>
          ) : null}
          {item.overnightRequired ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Overnight</dt>
              <dd>{item.overnightCity ?? "Yes (see notes)"}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white px-6 py-5 font-body text-sm text-kelly-text/85">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Roles & contacts</h2>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Kelly&apos;s role</dt>
            <dd>{dd?.kellyRole ?? "— (fill when promoting to CampaignEvent)"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Host</dt>
            <dd>{dd?.host ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Contacts</dt>
            <dd>{dd?.contacts ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-kelly-text/45">Spreadsheet context</dt>
            <dd>
              {dd?.spreadsheetTab ?? "—"}
              {dd?.rowHint ? ` · ${dd.rowHint}` : ""}
            </dd>
          </div>
          {dd?.matchedDb ? (
            <div>
              <dt className="text-[10px] font-bold uppercase text-kelly-text/45">DB link</dt>
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
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/55">Notes</h2>
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
