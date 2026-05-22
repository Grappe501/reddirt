import Link from "next/link";
import { CampaignCalendarShell } from "@/components/admin/campaign-calendar/CampaignCalendarShell";
import { loadCampaignCalendarSurface, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";

export const dynamic = "force-dynamic";

export default async function CampaignCalendarLayout({ children }: { children: React.ReactNode }) {
  const { rows, electionDayYmd, nowMs, seed } = await loadCampaignCalendarSurface();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-slate">Campaign operating system · calendar</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">Campaign Calendar</h1>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
          Command-center views from now through Election Day. Each event is a travel, operations, approval, and knowledge object — not
          just a schedule block. No Google write/sync or email send in this pass.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/campaign-events/workbench" className="rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold">
            Workbench
          </Link>
          <Link href="/admin/campaign-events/march-2026" className="rounded-full border border-kelly-navy/25 bg-kelly-navy/5 px-4 py-2 font-body text-sm font-bold text-kelly-navy">
            March ledger
          </Link>
        </div>
        <p className="mt-3 font-body text-xs text-kelly-subtle">
          Loaded {rows.length} events · seed sync {seed.updated} updated
        </p>
      </section>

      <CampaignCalendarShell rows={serializeCalendarRows(rows)} electionDayYmd={electionDayYmd} nowMs={nowMs}>
        {children}
      </CampaignCalendarShell>
    </div>
  );
}
