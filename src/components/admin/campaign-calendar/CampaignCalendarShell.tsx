"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { EventReviewModal } from "@/components/admin/campaign-events/EventReviewModal";
import { CampaignCalendarProvider, useCampaignCalendar } from "./campaign-calendar-context";
import { CampaignCalendarHero } from "./calendar-ui/CampaignCalendarHero";
import { CampaignCalendarCommandBar } from "./calendar-ui/CampaignCalendarCommandBar";
import { CampaignCalendarViewRail } from "./calendar-ui/CampaignCalendarViewRail";
import { computeCalendarSurfaceStats } from "./calendar-ui/compute-calendar-surface-stats";
import { cal } from "./calendar-ui/calendar-design-tokens";

function ReviewModalHost() {
  const { reviewRecordId, setReviewRecordId } = useCampaignCalendar();
  const router = useRouter();
  if (!reviewRecordId) return null;
  return (
    <EventReviewModal
      recordId={reviewRecordId}
      onClose={() => {
        setReviewRecordId(null);
        router.refresh();
      }}
    />
  );
}

function CampaignCalendarChrome({
  seedLabel,
  children,
}: {
  seedLabel?: string;
  children: React.ReactNode;
}) {
  const { rows, electionDayYmd, nowMs } = useCampaignCalendar();
  const stats = useMemo(
    () => computeCalendarSurfaceStats(rows, electionDayYmd, nowMs),
    [rows, electionDayYmd, nowMs],
  );

  return (
    <div className={`${cal.canvas} space-y-5`}>
      <CampaignCalendarHero stats={stats} seedLabel={seedLabel} />
      <CampaignCalendarCommandBar stats={stats} />
      <CampaignCalendarViewRail eventCount={rows.length} />
      <div className={cal.panel}>{children}</div>
      <ReviewModalHost />
    </div>
  );
}

export function CampaignCalendarShell({
  rows,
  electionDayYmd,
  nowMs,
  seedLabel,
  children,
}: {
  rows: CalendarSurfaceRow[];
  electionDayYmd: string;
  nowMs: number;
  seedLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <CampaignCalendarProvider rows={rows} electionDayYmd={electionDayYmd} nowMs={nowMs}>
      <CampaignCalendarChrome seedLabel={seedLabel}>{children}</CampaignCalendarChrome>
    </CampaignCalendarProvider>
  );
}
