import { CampaignCalendarShell } from "@/components/admin/campaign-calendar/CampaignCalendarShell";
import { loadCampaignCalendarSurface, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";

export const dynamic = "force-dynamic";

export default async function CampaignCalendarLayout({ children }: { children: React.ReactNode }) {
  const { rows, electionDayYmd, nowMs, seed } = await loadCampaignCalendarSurface();
  const seedLabel = `Ledger sync · ${rows.length} events loaded · ${seed.updated} records updated`;

  return (
    <div className="mx-auto max-w-[1520px] pb-16 pt-2">
      <CampaignCalendarShell
        rows={serializeCalendarRows(rows)}
        electionDayYmd={electionDayYmd}
        nowMs={nowMs}
        seedLabel={seedLabel}
      >
        {children}
      </CampaignCalendarShell>
    </div>
  );
}
