import Link from "next/link";
import { MarchCampaignEventLedger } from "@/components/admin/campaign-events/MarchCampaignEventLedger";
import {
  CampaignEventsNav,
  CampaignEventsPageHeader,
  InfoBanner,
} from "@/app/admin/(board)/campaign-events/components";
import { formatLedgerDayHeading, groupEventsByDay, loadMarch2026CampaignEvents } from "@/lib/campaign-events/load-march-events";
import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "@/lib/campaign-events/constants";

export const dynamic = "force-dynamic";

export default async function March2026CampaignEventsPage() {
  const { rows, seed } = await loadMarch2026CampaignEvents();
  const byDay = groupEventsByDay(rows);
  const days = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ymd, events]) => ({
      ymd,
      heading: formatLedgerDayHeading(ymd),
      events,
    }));

  const houseCount = rows.filter((r) => r.classification === "house_meet_greet").length;
  const workWarnings = rows.filter((r) => r.workHours.show).length;
  const conflictCount = rows.filter((r) => r.conflicts.length > 0).length;
  const totalGaps = rows.reduce((sum, r) => sum + r.persistedMissingCount, 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operations · persisted fact cards"
        title="March 2026 Campaign Event Ledger"
        description="Chronological monthly view with one-line summaries. Use Review with AI on one event at a time — deterministic inference, edit, save, and approve. Section edits still available when expanded."
        actions={
          <>
            <Link
              href="/admin/calendar-command-center"
              className="inline-flex rounded-full border border-kelly-navy/25 bg-kelly-page px-4 py-2 font-body text-sm font-bold text-kelly-navy"
            >
              Calendar command center
            </Link>
            <Link
              href="/admin/travel-ledger"
              className="inline-flex rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold text-kelly-text/75"
            >
              Travel ledger
            </Link>
          </>
        }
      />
      <CampaignEventsNav />

      <InfoBanner>
        <strong>Persistence:</strong> Prisma <code className="text-xs">CampaignEventLedgerRecord</code> + per-event review modal (CE-LEDGER-2). Review one calendar entry at a time — not bulk.
        Last seed: {seed.scanned} scanned, {seed.created} created, {seed.updated} updated. Re-open or run{" "}
        <code className="text-xs">npm run campaign-events:seed-march</code> — upserts by calendar id (no duplicates).
        Mileage rate: <strong>${CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE.toFixed(2)}/mi</strong> (TODO: policy align 0.725).
      </InfoBanner>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="March events" value={String(rows.length)} />
        <StatCard label="Work-hour warnings" value={String(workWarnings)} />
        <StatCard label="Conflict badges" value={String(conflictCount)} />
        <StatCard label="Open field gaps" value={String(totalGaps)} />
      </section>

      {houseCount === 0 ? (
        <InfoBanner tone="amber">
          No March rows typed as House Meet &amp; Greet yet — title patterns still classify some gatherings automatically when added.
        </InfoBanner>
      ) : null}

      {rows.length ? (
        <MarchCampaignEventLedger days={days} />
      ) : (
        <InfoBanner tone="amber">
          No March records. Ensure Postgres is running, run <code className="text-xs">npm run dev:prepare</code>, then reload.
        </InfoBanner>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 shadow-[var(--shadow-soft)]">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-kelly-text">{value}</p>
    </div>
  );
}
